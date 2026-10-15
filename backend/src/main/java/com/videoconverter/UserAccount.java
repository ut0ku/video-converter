package com.videoconverter;

public record UserAccount(String email, String passwordHash, String role) {}
