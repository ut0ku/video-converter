package com.videoconverter;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PersistentStore {
    public record UsageData(
            Map<String, Integer> counters,
            Map<String, String> counterDates,
            Map<String, Map<String, Integer>> formats,
            Map<String, Integer> extraLimits,
            Map<String, Integer> dailyConversions,
            Map<String, Map<String, Integer>> subjectDaily) {}

    private final JdbcTemplate jdbc;

    public PersistentStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
        renameLegacyTables();
        createSchema();
        migrateLegacySchema();
    }

    private void renameLegacyTables() {
        renameIfLegacy("usage_counters");
        renameIfLegacy("usage_formats");
        renameIfLegacy("usage_daily");
    }

    private void renameIfLegacy(String table) {
        if (tableExists(table) && columnExists(table, "identity") || table.equals("usage_daily") && tableExists(table)
                && columnExists(table, "conversion_date") && !columnExists(table, "subject_id")) {
            jdbc.execute("ALTER TABLE " + table + " RENAME TO legacy_" + table);
        }
    }

    private void createSchema() {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS app_users (
                    email VARCHAR(320) PRIMARY KEY,
                    password_hash TEXT NOT NULL,
                    role VARCHAR(32) NOT NULL
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS usage_subjects (
                    id BIGSERIAL PRIMARY KEY,
                    identity VARCHAR(320) NOT NULL UNIQUE,
                    user_email VARCHAR(320) UNIQUE REFERENCES app_users(email) ON DELETE CASCADE,
                    guest_ip VARCHAR(128),
                    CONSTRAINT usage_subject_type_ck CHECK (
                        (user_email IS NOT NULL AND guest_ip IS NULL)
                        OR (user_email IS NULL AND guest_ip IS NOT NULL)
                    )
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS usage_limits (
                    email VARCHAR(320) PRIMARY KEY REFERENCES app_users(email) ON DELETE CASCADE,
                    extra_limit INTEGER NOT NULL
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS usage_counters (
                    subject_id BIGINT PRIMARY KEY REFERENCES usage_subjects(id) ON DELETE CASCADE,
                    counter_date DATE NOT NULL,
                    count INTEGER NOT NULL
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS usage_formats (
                    subject_id BIGINT NOT NULL REFERENCES usage_subjects(id) ON DELETE CASCADE,
                    format VARCHAR(16) NOT NULL,
                    count INTEGER NOT NULL,
                    PRIMARY KEY (subject_id, format)
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS usage_daily (
                    subject_id BIGINT NOT NULL REFERENCES usage_subjects(id) ON DELETE CASCADE,
                    conversion_date DATE NOT NULL,
                    count INTEGER NOT NULL,
                    PRIMARY KEY (subject_id, conversion_date)
                )
                """);
    }

    private void migrateLegacySchema() {
        if (!tableExists("legacy_usage_counters")) return;
        jdbc.update("""
                INSERT INTO usage_subjects(identity, user_email, guest_ip)
                SELECT DISTINCT identity,
                    CASE WHEN identity LIKE 'guest:%' THEN NULL ELSE identity END,
                    CASE WHEN identity LIKE 'guest:%' THEN substring(identity from 7) ELSE NULL END
                FROM legacy_usage_counters
                ON CONFLICT (identity) DO NOTHING
                """);
        jdbc.update("""
                INSERT INTO usage_subjects(identity, user_email, guest_ip)
                SELECT DISTINCT identity,
                    CASE WHEN identity LIKE 'guest:%' THEN NULL ELSE identity END,
                    CASE WHEN identity LIKE 'guest:%' THEN substring(identity from 7) ELSE NULL END
                FROM legacy_usage_formats
                ON CONFLICT (identity) DO NOTHING
                """);
        jdbc.execute("""
                INSERT INTO usage_counters(subject_id, counter_date, count)
                SELECT s.id, c.counter_date, c.count
                FROM legacy_usage_counters c JOIN usage_subjects s ON s.identity = c.identity
                ON CONFLICT (subject_id) DO UPDATE SET counter_date = EXCLUDED.counter_date, count = EXCLUDED.count
                """);
        jdbc.execute("""
                INSERT INTO usage_formats(subject_id, format, count)
                SELECT s.id, f.format, f.count
                FROM legacy_usage_formats f JOIN usage_subjects s ON s.identity = f.identity
                ON CONFLICT (subject_id, format) DO UPDATE SET count = EXCLUDED.count
                """);
        jdbc.execute("""
                INSERT INTO usage_subjects(identity, guest_ip)
                VALUES ('guest:__system__', '__system__')
                ON CONFLICT (identity) DO NOTHING
                """);
        jdbc.execute("""
                INSERT INTO usage_daily(subject_id, conversion_date, count)
                SELECT s.id, d.conversion_date, d.count
                FROM usage_subjects s CROSS JOIN legacy_usage_daily d
                WHERE s.identity = 'guest:__system__' AND d.count > 0
                ON CONFLICT (subject_id, conversion_date) DO NOTHING
                """);
        jdbc.execute("DROP TABLE legacy_usage_counters");
        jdbc.execute("DROP TABLE legacy_usage_formats");
        jdbc.execute("DROP TABLE legacy_usage_daily");
    }

    private boolean tableExists(String table) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, "public." + table));
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbc.queryForObject("""
                SELECT count(*) FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
                """, Integer.class, table, column);
        return count != null && count > 0;
    }

    public synchronized Map<String, UserAccount> loadUsers() {
        Map<String, UserAccount> users = new HashMap<>();
        jdbc.query("SELECT email, password_hash, role FROM app_users", (RowCallbackHandler) row ->
                users.put(row.getString("email"), new UserAccount(row.getString("email"),
                        row.getString("password_hash"), row.getString("role"))));
        return users;
    }

    public synchronized void saveUsers(Map<String, UserAccount> users) {
        users.forEach((email, user) -> jdbc.update("""
                INSERT INTO app_users(email, password_hash, role) VALUES (?, ?, ?)
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
                """, email, user.passwordHash(), user.role()));
    }

    public synchronized UsageData loadUsage() {
        Map<String, Integer> counters = new HashMap<>();
        Map<String, String> dates = new HashMap<>();
        jdbc.query("""
                SELECT s.identity, c.counter_date, c.count FROM usage_counters c
                JOIN usage_subjects s ON s.id = c.subject_id
                """, (RowCallbackHandler) row -> {
            counters.put(row.getString("identity"), row.getInt("count"));
            dates.put(row.getString("identity"), row.getDate("counter_date").toLocalDate().toString());
        });
        Map<String, Map<String, Integer>> formats = new HashMap<>();
        jdbc.query("""
                SELECT s.identity, f.format, f.count FROM usage_formats f
                JOIN usage_subjects s ON s.id = f.subject_id
                """, (RowCallbackHandler) row -> formats
                .computeIfAbsent(row.getString("identity"), ignored -> new HashMap<>())
                .put(row.getString("format"), row.getInt("count")));
        Map<String, Integer> limits = new HashMap<>();
        jdbc.query("SELECT email, extra_limit FROM usage_limits", (RowCallbackHandler) row ->
                limits.put(row.getString("email"), row.getInt("extra_limit")));
        Map<String, Map<String, Integer>> subjectDaily = new HashMap<>();
        Map<String, Integer> daily = new HashMap<>();
        jdbc.query("""
                SELECT s.identity, d.conversion_date, d.count FROM usage_daily d
                JOIN usage_subjects s ON s.id = d.subject_id
                """, (RowCallbackHandler) row -> {
            String date = row.getDate("conversion_date").toLocalDate().toString();
            int count = row.getInt("count");
            subjectDaily.computeIfAbsent(row.getString("identity"), ignored -> new HashMap<>()).put(date, count);
            daily.merge(date, count, Integer::sum);
        });
        return new UsageData(counters, dates, formats, limits, daily, subjectDaily);
    }

    public synchronized void saveUsage(UsageData data) {
        data.counters().forEach((identity, count) -> {
            long subjectId = subjectId(identity);
            jdbc.update("""
                    INSERT INTO usage_counters(subject_id, counter_date, count) VALUES (?, ?, ?)
                    ON CONFLICT (subject_id) DO UPDATE SET counter_date = EXCLUDED.counter_date, count = EXCLUDED.count
                    """, subjectId, java.sql.Date.valueOf(data.counterDates().get(identity)), count);
        });
        data.formats().forEach((identity, values) -> values.forEach((format, count) -> jdbc.update("""
                INSERT INTO usage_formats(subject_id, format, count) VALUES (?, ?, ?)
                ON CONFLICT (subject_id, format) DO UPDATE SET count = EXCLUDED.count
                """, subjectId(identity), format, count)));
        data.extraLimits().forEach((email, limit) -> jdbc.update("""
                INSERT INTO usage_limits(email, extra_limit) VALUES (?, ?)
                ON CONFLICT (email) DO UPDATE SET extra_limit = EXCLUDED.extra_limit
                """, email, limit));
        data.subjectDaily().forEach((identity, values) -> values.forEach((date, count) -> jdbc.update("""
                INSERT INTO usage_daily(subject_id, conversion_date, count) VALUES (?, ?, ?)
                ON CONFLICT (subject_id, conversion_date) DO UPDATE SET count = EXCLUDED.count
                """, subjectId(identity), java.sql.Date.valueOf(date), count)));
    }

    private long subjectId(String identity) {
        jdbc.update("""
                INSERT INTO usage_subjects(identity, user_email, guest_ip) VALUES (?, ?, ?)
                ON CONFLICT (identity) DO NOTHING
                """, identity, identity.startsWith("guest:") ? null : identity,
                identity.startsWith("guest:") ? identity.substring(6) : null);
        return jdbc.queryForObject("SELECT id FROM usage_subjects WHERE identity = ?", Long.class, identity);
    }
}
