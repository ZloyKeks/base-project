package com.example.base.controller;

import com.example.base.dto.RegisterRequest;
import com.example.base.dto.UpdateUserRequest;
import com.example.base.dto.UserInfo;
import com.example.base.service.AuthService;
import com.example.base.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:8080")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping("/me")
    public ResponseEntity<UserInfo> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserInfo>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> registerUser(@Valid @RequestBody RegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            authService.registerByAdmin(request);
            response.put("message", "User registered successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.updateCurrentUser(request);
            response.put("message", "User updated successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.updateUser(id, request);
            response.put("message", "User updated successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.deleteUser(id);
            response.put("message", "User deleted successfully");
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
}




