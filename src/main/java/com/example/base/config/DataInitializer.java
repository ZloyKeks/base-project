package com.example.base.config;

import com.example.base.model.Role;
import com.example.base.model.User;
import com.example.base.repository.RoleRepository;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements ApplicationRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // Создаем роли, если их еще нет
        roleRepository.findByName(Role.RoleType.USER)
            .orElseGet(() -> {
                Role role = new Role();
                role.setName(Role.RoleType.USER);
                return roleRepository.save(role);
            });
        
        Role adminRole = roleRepository.findByName(Role.RoleType.ADMIN)
            .orElseGet(() -> {
                Role role = new Role();
                role.setName(Role.RoleType.ADMIN);
                return roleRepository.save(role);
            });
        
        // Создаем пользователя admin, если его еще нет
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@example.com");
            
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);
            
            userRepository.save(admin);
            System.out.println("Пользователь admin создан с паролем: admin");
        }
    }
}

