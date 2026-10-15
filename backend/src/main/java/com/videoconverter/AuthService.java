package com.videoconverter;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final PersistentStore store;
    public AuthService(PasswordEncoder encoder, JwtService jwt,
                       PersistentStore store,
                       @org.springframework.beans.factory.annotation.Value("${app.admin-email}") String adminEmail,
                       @org.springframework.beans.factory.annotation.Value("${app.admin-password}") String adminPassword) {
        this.encoder = encoder; this.jwt = jwt; this.store = store;
        users.putAll(store.loadUsers());
        users.putIfAbsent(adminEmail.toLowerCase(), new UserAccount(adminEmail.toLowerCase(), encoder.encode(adminPassword), "ADMIN"));
        store.saveUsers(users);
    }
    public String register(String email, String password) {
        String normalized = normalize(email);
        if (password == null || password.length() < 5) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must contain at least 5 characters");
        if (users.putIfAbsent(normalized, new UserAccount(normalized, encoder.encode(password), "USER")) != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        store.saveUsers(users);
        return jwt.token(users.get(normalized));
    }
    public String login(String email, String password) {
        UserAccount user = users.get(normalize(email));
        if (user == null || !encoder.matches(password, user.passwordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        return jwt.token(user);
    }
    public UserAccount find(String email) { return users.get(normalize(email)); }
    public java.util.List<UserAccount> allUsers() { return users.values().stream().sorted(java.util.Comparator.comparing(UserAccount::email)).toList(); }
    private String normalize(String email) {
        if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid email is required");
        return email.toLowerCase();
    }
}
