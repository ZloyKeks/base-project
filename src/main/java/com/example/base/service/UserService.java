package com.example.base.service;

import com.example.base.dto.UserInfo;
import com.example.base.model.User;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserInfo getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new UserInfo(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.isAdmin()
        );
    }
    
    public List<UserInfo> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> new UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isAdmin()
            ))
            .collect(Collectors.toList());
    }
}




