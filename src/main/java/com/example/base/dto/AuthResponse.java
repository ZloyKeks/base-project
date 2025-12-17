package com.example.base.dto;

public class AuthResponse {
    private String token;
    private String username;
    private boolean isAdmin;
    private String message;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String token, String username, boolean isAdmin, String message) {
        this.token = token;
        this.username = username;
        this.isAdmin = isAdmin;
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public boolean isAdmin() {
        return isAdmin;
    }
    
    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}


