package com.videoconverter;

import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicReference;

public final class ConversionJob {
    public enum State { QUEUED, RUNNING, DONE, FAILED, CANCELLED }

    private final String id;
    private final Path input;
    private final Path output;
    private final long durationMs;
    private final String identity;
    private final int usageToday;
    private final AtomicReference<State> state = new AtomicReference<>(State.QUEUED);
    private volatile int progress;
    private volatile String stage = "analyze";
    private volatile String error;
    private volatile Process process;

    public ConversionJob(String id, Path input, Path output, long durationMs, String identity, int usageToday) {
        this.id = id;
        this.input = input;
        this.output = output;
        this.durationMs = durationMs;
        this.identity = identity;
        this.usageToday = usageToday;
    }

    public String id() { return id; }
    public Path input() { return input; }
    public Path output() { return output; }
    public long durationMs() { return durationMs; }
    public String identity() { return identity; }
    public int usageToday() { return usageToday; }
    public State state() { return state.get(); }
    public void state(State value) { state.set(value); }
    public int progress() { return progress; }
    public void progress(int value) { progress = Math.max(0, Math.min(100, value)); }
    public String stage() { return stage; }
    public void stage(String value) { stage = value; }
    public String error() { return error; }
    public void error(String value) { error = value; }
    public Process process() { return process; }
    public void process(Process value) { process = value; }
}
