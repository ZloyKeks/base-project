package com.example.base.service;

import com.example.base.dto.UpdateUserRequest;
import com.example.base.dto.UserInfo;
import com.example.base.model.Role;
import com.example.base.model.User;
import com.example.base.repository.RoleRepository;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
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
    
    @Transactional
    public void updateCurrentUser(UpdateUserRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Проверка уникальности username (если изменился)
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
        }
        
        // Проверка уникальности email (если изменился)
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }
        
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // Обновляем пароль только если он указан
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Роль не изменяем при обновлении текущего пользователя
        userRepository.save(user);
    }
    
    @Transactional
    public void updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Проверка уникальности username (если изменился)
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
        }
        
        // Проверка уникальности email (если изменился)
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }
        
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // Обновляем пароль только если он указан
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Обновляем роли - сначала очищаем старые
        user.getRoles().clear();
        Set<Role> roles = new HashSet<>();
        if (request.isAdmin()) {
            Role adminRole = roleRepository.findByName(Role.RoleType.ADMIN)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Role.RoleType.ADMIN);
                    return roleRepository.save(newRole);
                });
            roles.add(adminRole);
        } else {
            Role userRole = roleRepository.findByName(Role.RoleType.USER)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(Role.RoleType.USER);
                    return roleRepository.save(newRole);
                });
            roles.add(userRole);
        }
        user.setRoles(roles);
        
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Не позволяем удалить самого себя
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Cannot delete your own account");
        }
        
        userRepository.delete(user);
    }
}




