package com.videoconverter;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class UsageService {
    public record Usage(String identity, boolean registered, int used, int limit) {}
    private record Counter(LocalDate date, AtomicInteger count) {}
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();
    private final Map<String, Map<String, AtomicInteger>> formats = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> extraLimits = new ConcurrentHashMap<>();
    private final Map<LocalDate, AtomicInteger> dailyConversions = new ConcurrentHashMap<>();
    private final Map<String, Map<LocalDate, AtomicInteger>> subjectDaily = new ConcurrentHashMap<>();
    private final String adminEmail;

    private final PersistentStore store;

    public UsageService(@org.springframework.beans.factory.annotation.Value("${app.admin-email}") String adminEmail,
                         PersistentStore store) {
        this.adminEmail = adminEmail.toLowerCase();
        this.store = store;
        restore(store.loadUsage());
    }

    public Usage consume(String identity, boolean registered, String format) {
        int limit = limitFor(identity, registered);
        Counter counter = counters.compute(identity, (key, old) -> {
            if (old == null || !old.date().equals(LocalDate.now())) return new Counter(LocalDate.now(), new AtomicInteger());
            return old;
        });
        int used = counter.count().incrementAndGet();
        if (used > limit) {
            counter.count().decrementAndGet();
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Daily conversion limit reached (" + limit + ")");
        }
        formats.computeIfAbsent(identity, ignored -> new ConcurrentHashMap<>())
                .computeIfAbsent(format, ignored -> new AtomicInteger()).incrementAndGet();
        dailyConversions.computeIfAbsent(LocalDate.now(), ignored -> new AtomicInteger()).incrementAndGet();
        subjectDaily.computeIfAbsent(identity, ignored -> new ConcurrentHashMap<>())
                .computeIfAbsent(LocalDate.now(), ignored -> new AtomicInteger()).incrementAndGet();
        persist();
        return new Usage(identity, registered, used, limit);
    }
    public Usage snapshot(String identity, boolean registered) {
        int limit = limitFor(identity, registered);
        Counter counter = counters.get(identity);
        int used = counter == null || !counter.date().equals(LocalDate.now()) ? 0 : counter.count().get();
        return new Usage(identity, registered, used, limit);
    }
    public Map<String, Integer> statistics() {
        Map<String, Integer> result = new TreeMap<>();
        formats.values().forEach(byFormat -> byFormat.forEach((format, count) -> result.merge(format, count.get(), Integer::sum)));
        return result;
    }

    public Map<String, Integer> dailyStatistics() {
        Map<String, Integer> result = new TreeMap<>();
        dailyConversions.forEach((date, count) -> result.put(date.format(DateTimeFormatter.ISO_DATE), count.get()));
        return result;
    }

    public int totalConversions() {
        return dailyConversions.values().stream().mapToInt(AtomicInteger::get).sum();
    }

    public int grantExtraLimit(String email, int amount) {
        if (amount < 1 || amount > 100_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Дополнительный лимит должен быть от 1 до 100000");
        }
        int total = extraLimits.computeIfAbsent(email.toLowerCase(), ignored -> new AtomicInteger()).addAndGet(amount);
        persist();
        return total;
    }

    public int extraLimit(String email) {
        AtomicInteger amount = extraLimits.get(email.toLowerCase());
        return amount == null ? 0 : amount.get();
    }

    private void restore(PersistentStore.UsageData data) {
        data.counters().forEach((identity, count) -> {
            LocalDate date = data.counterDates().containsKey(identity)
                    ? LocalDate.parse(data.counterDates().get(identity)) : LocalDate.now();
            counters.put(identity, new Counter(date, new AtomicInteger(count)));
        });
        data.formats().forEach((identity, values) -> {
            Map<String, AtomicInteger> restored = new ConcurrentHashMap<>();
            values.forEach((format, count) -> restored.put(format, new AtomicInteger(count)));
            formats.put(identity, restored);
        });
        data.extraLimits().forEach((email, amount) -> extraLimits.put(email, new AtomicInteger(amount)));
        data.dailyConversions().forEach((date, count) -> dailyConversions.put(LocalDate.parse(date), new AtomicInteger(count)));
        data.subjectDaily().forEach((identity, values) -> {
            Map<LocalDate, AtomicInteger> restored = new ConcurrentHashMap<>();
            values.forEach((date, count) -> restored.put(LocalDate.parse(date), new AtomicInteger(count)));
            subjectDaily.put(identity, restored);
        });
    }

    private synchronized void persist() {
        Map<String, Integer> currentCounters = new TreeMap<>();
        Map<String, String> currentCounterDates = new TreeMap<>();
        counters.forEach((identity, counter) -> {
            currentCounters.put(identity, counter.count().get());
            currentCounterDates.put(identity, counter.date().toString());
        });
        Map<String, Map<String, Integer>> currentFormats = new TreeMap<>();
        formats.forEach((identity, values) -> {
            Map<String, Integer> restored = new TreeMap<>();
            values.forEach((format, count) -> restored.put(format, count.get()));
            currentFormats.put(identity, restored);
        });
        Map<String, Integer> currentExtra = new TreeMap<>();
        extraLimits.forEach((email, amount) -> currentExtra.put(email, amount.get()));
        Map<String, Integer> currentDaily = new TreeMap<>();
        dailyConversions.forEach((date, count) -> currentDaily.put(date.toString(), count.get()));
        Map<String, Map<String, Integer>> currentSubjectDaily = new TreeMap<>();
        subjectDaily.forEach((identity, values) -> {
            Map<String, Integer> dates = new TreeMap<>();
            values.forEach((date, count) -> dates.put(date.toString(), count.get()));
            currentSubjectDaily.put(identity, dates);
        });
        store.saveUsage(new PersistentStore.UsageData(currentCounters, currentCounterDates, currentFormats, currentExtra, currentDaily, currentSubjectDaily));
    }

    private int limitFor(String identity, boolean registered) {
        if (!registered) return 10;
        if (adminEmail.equalsIgnoreCase(identity)) return 100_000;
        return 100 + extraLimit(identity);
    }
}
