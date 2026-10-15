package com.videoconverter;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usage")
public class UsageController {
    private final UsageService usage;

    public UsageController(UsageService usage) {
        this.usage = usage;
    }

    @GetMapping
    public Map<String, Object> current(Authentication authentication, HttpServletRequest request) {
        boolean registered = authentication != null && authentication.isAuthenticated();
        String identity = registered
                ? authentication.getName()
                : "guest:" + request.getRemoteAddr();
        UsageService.Usage current = usage.snapshot(identity, registered);
        return Map.of(
                "used", current.used(),
                "limit", current.limit(),
                "remaining", Math.max(0, current.limit() - current.used()),
                "registered", registered
        );
    }
}
