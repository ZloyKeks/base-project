package com.example.base.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserInfo {
    private Long id;
    private String username;
    private String email;
    private boolean isAdmin;
    
    public UserInfo() {
    }
    
    public UserInfo(Long id, String username, String email, boolean isAdmin) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.isAdmin = isAdmin;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    @JsonProperty("isAdmin")
    public boolean isAdmin() {
        return isAdmin;
    }
    
    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }
}


