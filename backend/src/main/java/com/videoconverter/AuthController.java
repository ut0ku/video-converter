package com.videoconverter;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UsageService usage;
    public AuthController(AuthService auth, UsageService usage) { this.auth = auth; this.usage = usage; }
    public record Credentials(@Email @NotBlank String email, @NotBlank @Size(min = 5) String password) {}
    @PostMapping("/register") public java.util.Map<String, String> register(@Valid @RequestBody Credentials c) { return java.util.Map.of("token", auth.register(c.email(), c.password()), "email", c.email().toLowerCase()); }
    @PostMapping("/login") public java.util.Map<String, String> login(@Valid @RequestBody Credentials c) { return java.util.Map.of("token", auth.login(c.email(), c.password()), "email", c.email().toLowerCase()); }
    @GetMapping("/me")
    public java.util.Map<String, Object> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        UsageService.Usage current = usage.snapshot(authentication.getName(), true);
        return java.util.Map.of("user", java.util.Map.of("email", authentication.getName(), "admin", admin),
                "usage", java.util.Map.of("used", current.used(), "limit", current.limit()));
    }
}
