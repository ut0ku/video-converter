package com.videoconverter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConversionService {
    private static final Set<String> FORMATS = Set.of("mp4", "webm", "mkv", "mov", "avi", "gif");
    private static final Map<String, String> STAGES = Map.of(
            "analyze", "analyze", "decode", "decode", "encode", "encode", "mux", "mux");

    private final Path storageDir;
    private final String ffmpegPath;
    private final ExecutorService executor;
    private final Map<String, ConversionJob> jobs = new ConcurrentHashMap<>();

    public ConversionService(
            @Value("${converter.storage-dir}") String storage,
            @Value("${converter.ffmpeg-path}") String ffmpegPath,
            @Value("${converter.max-concurrent-jobs}") int maxConcurrentJobs) throws IOException {
        this.storageDir = Path.of(storage);
        this.ffmpegPath = ffmpegPath;
        Files.createDirectories(storageDir);
        this.executor = Executors.newFixedThreadPool(Math.max(1, maxConcurrentJobs));
    }

    public ConversionJob create(MultipartFile file, ConversionRequest request, UsageService.Usage usage) {
        validate(request);
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Файл пустой");
        }

        String id = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename() == null ? "input" : file.getOriginalFilename();
        Path input = storageDir.resolve(id + "-input-" + safeName(originalName));
        Path output = storageDir.resolve(id + "-output." + request.format());
        try {
            file.transferTo(input);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось сохранить файл", e);
        }

        ConversionJob job = new ConversionJob(id, input, output, request.durationMs() == null ? 0 : request.durationMs(),
                usage.identity(), usage.used());
        jobs.put(id, job);
        executor.submit(() -> run(job, request));
        return job;
    }

    public ConversionJob get(String id) {
        ConversionJob job = jobs.get(id);
        if (job == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Задача не найдена");
        return job;
    }

    public void cancel(String id) {
        ConversionJob job = get(id);
        if (job.state() == ConversionJob.State.RUNNING && job.process() != null) {
            job.process().destroy();
        }
        job.state(ConversionJob.State.CANCELLED);
        cleanup(job);
    }

    public Path output(String id) {
        ConversionJob job = get(id);
        if (job.state() != ConversionJob.State.DONE || !Files.exists(job.output())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Файл ещё не готов");
        }

        return job.output();
    }

    public Map<String, Integer> jobStatistics() {
        Map<String, Integer> result = new java.util.TreeMap<>();
        for (ConversionJob job : jobs.values()) {
            result.merge(job.state().name().toLowerCase(), 1, Integer::sum);
        }
        return result;
    }

    private void run(ConversionJob job, ConversionRequest request) {
        job.state(ConversionJob.State.RUNNING);
        try {
            ProcessBuilder builder = new ProcessBuilder(buildCommand(job, request));
            builder.redirectErrorStream(false);
            Process process = builder.start();
            job.process(process);
            Thread errors = Thread.ofVirtual().start(() -> drainErrors(process));
            try (BufferedReader progress = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                parseProgress(progress, job);
            }
            int exit = process.waitFor();
            errors.join();
            if (job.state() == ConversionJob.State.CANCELLED) return;
            if (exit != 0) throw new IOException("FFmpeg завершился с кодом " + exit);
            job.progress(100);
            job.stage("done");
            job.state(ConversionJob.State.DONE);
            Files.deleteIfExists(job.input());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            job.state(ConversionJob.State.CANCELLED);
        } catch (Exception e) {
            job.error(e.getMessage() == null ? "Ошибка конвертации" : e.getMessage());
            job.state(ConversionJob.State.FAILED);
            cleanup(job);
        }
    }

    private void parseProgress(BufferedReader reader, ConversionJob job) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.startsWith("out_time_ms=") && job.durationMs() > 0) {
                String rawTime = line.substring("out_time_ms=".length()).trim();
                if ("N/A".equalsIgnoreCase(rawTime)) {
                    continue;
                }
                long current;
                try {
                    current = Long.parseLong(rawTime);
                } catch (NumberFormatException ignored) {
                    continue;
                }
                job.progress((int) Math.min(99, current * 100 / job.durationMs()));
                job.stage(job.progress() < 8 ? "analyze" : job.progress() < 40 ? "decode" : job.progress() < 88 ? "encode" : "mux");
            }
        }
    }

    private java.util.List<String> buildCommand(ConversionJob job, ConversionRequest r) {
        String format = r.format();
        java.util.List<String> command = new java.util.ArrayList<>();
        command.add(ffmpegPath);
        command.add("-y");
        command.add("-i"); command.add(job.input().toString());
        String filter = filter(r);
        if (!filter.isBlank()) { command.add("-vf"); command.add(filter); }
        if ("gif".equals(format)) {
            command.add("-an");
        } else {
            command.add("-c:a"); command.add(audioCodec(format));
        }
        command.add("-c:v"); command.add(videoCodec(format));
        if (!"gif".equals(format)) { command.add("-crf"); command.add(String.valueOf(crf(r.quality()))); }
        command.add("-progress"); command.add("pipe:1");
        command.add("-nostats");
        command.add(job.output().toString());
        return command;
    }

    private String filter(ConversionRequest r) {
        StringBuilder filter = new StringBuilder();
        if (!"source".equals(r.effectiveResolution())) {
            if (r.width() == null || r.height() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Не указано разрешение");
            filter.append("scale=").append(r.width()).append(":").append(r.height());
        }
        if ("custom".equals(r.fpsMode())) {
            if (r.fps() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Не указан FPS");
            if (!filter.isEmpty()) filter.append(",");
            filter.append("fps=").append(r.fps());
        }
        return filter.toString();
    }

    private void validate(ConversionRequest r) {
        if (!FORMATS.contains(r.format())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неподдерживаемый формат");
        if (!Set.of("source", "custom").contains(r.resolutionMode()) || !Set.of("source", "custom").contains(r.fpsMode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неподдерживаемый режим параметров");
        }
    }

    private int crf(int quality) { return Math.max(18, Math.min(35, 44 - (int) Math.round(quality * 0.26))); }
    private String videoCodec(String format) { return switch (format) {
        case "webm" -> "libvpx-vp9"; case "avi" -> "mpeg4"; case "gif" -> "gif"; default -> "libx264"; }; }
    private String audioCodec(String format) { return switch (format) {
        case "webm" -> "libopus"; case "avi" -> "libmp3lame"; case "mov" -> "aac"; default -> "aac"; }; }
    private String safeName(String name) { return name.replaceAll("[^a-zA-Z0-9._-]", "_"); }
    private void drainErrors(Process process) {
        try (BufferedReader ignored = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            while (ignored.readLine() != null) { }
        } catch (IOException ignored) { }
    }
    private void cleanup(ConversionJob job) {
        try { Files.deleteIfExists(job.input()); Files.deleteIfExists(job.output()); }
        catch (IOException ignored) { }
    }
}
