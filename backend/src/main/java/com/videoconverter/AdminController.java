package com.videoconverter;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.lang.management.ManagementFactory;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UsageService usage;
    private final AuthService auth;
    private final ConversionService conversions;
    private final com.sun.management.OperatingSystemMXBean os =
            ManagementFactory.getPlatformMXBean(com.sun.management.OperatingSystemMXBean.class);
    public AdminController(UsageService usage, AuthService auth, ConversionService conversions) {
        this.usage = usage; this.auth = auth; this.conversions = conversions;
    }
    @GetMapping("/statistics")
    public Map<String, Object> statistics() {
        return Map.of(
                "totalConversions", usage.totalConversions(),
                "conversionTypeUsage", usage.statistics(),
                "dailyConversions", usage.dailyStatistics(),
                "jobStates", conversions.jobStatistics());
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return auth.allUsers().stream().map(user -> {
            UsageService.Usage current = usage.snapshot(user.email(), true);
            return Map.<String, Object>of(
                    "email", user.email(), "admin", "ADMIN".equals(user.role()),
                    "used", current.used(), "limit", current.limit(),
                    "extraLimit", usage.extraLimit(user.email()));
        }).toList();
    }

    public record LimitGrant(int amount) {}

    @PostMapping("/users/{email}/limit")
    public Map<String, Object> grantLimit(@PathVariable String email, @RequestBody LimitGrant grant) {
        UserAccount user = auth.find(email);
        if (user == null) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Пользователь не найден");
        int extra = usage.grantExtraLimit(user.email(), grant.amount());
        UsageService.Usage current = usage.snapshot(user.email(), true);
        return Map.of("email", user.email(), "extraLimit", extra, "limit", current.limit());
    }

    @GetMapping("/server")
    public Map<String, Object> server() {
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        double cpu = os == null ? -1 : os.getCpuLoad();
        return Map.of(
                "cpuLoad", cpu < 0 ? 0 : Math.round(cpu * 1000.0) / 10.0,
                "cpuLoadAvailable", cpu >= 0,
                "availableProcessors", runtime.availableProcessors(),
                "memoryUsedMb", usedMemory / 1024 / 1024,
                "memoryMaxMb", runtime.maxMemory() / 1024 / 1024,
                "memoryTotalMb", runtime.totalMemory() / 1024 / 1024,
                "jobs", conversions.jobStatistics());
    }
}
