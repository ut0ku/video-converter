package com.videoconverter;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ConversionRequest(
        @NotBlank String format,
        @NotBlank String resolutionMode,
        String resolution,
        @Min(1) @Max(16384) Integer width,
        @Min(1) @Max(16384) Integer height,
        @NotBlank String fpsMode,
        @Min(1) @Max(240) Double fps,
        @Min(30) @Max(100) Integer quality,
        @Min(0) Long durationMs
) {
    public String effectiveResolution() {
        return "source".equals(resolutionMode) ? "source" : resolution;
    }
}
