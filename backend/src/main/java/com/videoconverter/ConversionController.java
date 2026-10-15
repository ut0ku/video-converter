package com.videoconverter;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Map;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/conversions")
@Validated
@CrossOrigin
public class ConversionController {
    private final ConversionService service;
    private final UsageService usage;

    public ConversionController(ConversionService service, UsageService usage) { this.service = service; this.usage = usage; }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> create(
            @RequestPart("file") MultipartFile file,
            @Valid @ModelAttribute ConversionRequest request,
            Authentication authentication,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        boolean registered = authentication != null && authentication.isAuthenticated();
        String identity = registered ? authentication.getName() : "guest:" + httpRequest.getRemoteAddr();
        UsageService.Usage current = usage.consume(identity, registered, request.format());
        ConversionJob job = service.create(file, request, current);
        return Map.of("id", job.id(), "identity", identity, "usage", current.used(), "dailyLimit", current.limit());
    }

    @GetMapping("/{id}")
    public Map<String, Object> status(@PathVariable String id) {
        ConversionJob job = service.get(id);
        return Map.of(
                "id", job.id(), "state", job.state().name().toLowerCase(),
                "progress", job.progress(), "stage", job.stage(),
                "identity", job.identity(), "usage", job.usageToday(),
                "error", job.error() == null ? "" : job.error(),
                "downloadUrl", job.state() == ConversionJob.State.DONE ? "/api/conversions/" + id + "/download" : "");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable String id) { service.cancel(id); }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        Path output = service.output(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + output.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(output));
    }
}
