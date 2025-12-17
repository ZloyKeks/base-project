package com.example.base.service;

import com.example.base.dto.AuthResponse;
import com.example.base.dto.LoginRequest;
import com.example.base.dto.RegisterRequest;
import com.example.base.model.Role;
import com.example.base.model.User;
import com.example.base.repository.RoleRepository;
import com.example.base.repository.UserRepository;
import com.example.base.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, false, "Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, false, "Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(Role.RoleType.USER)
            .orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName(Role.RoleType.USER);
                return roleRepository.save(newRole);
            });
        roles.add(userRole);
        user.setRoles(roles);
        
        userRepository.save(user);
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails, false);
        
        return new AuthResponse(token, user.getUsername(), false, "Registration successful");
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );
            
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            boolean isAdmin = user.isAdmin();
            String token = jwtUtil.generateToken(userDetails, isAdmin);
            
            return new AuthResponse(token, user.getUsername(), isAdmin, "Login successful");
        } catch (Exception e) {
            return new AuthResponse(null, null, false, "Invalid username or password");
        }
    }
    
    @Transactional
    public String registerByAdmin(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        
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
        
        return "User registered successfully";
    }
}

