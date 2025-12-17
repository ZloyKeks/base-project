package com.example.base.service;

import com.example.base.dto.UserInfo;
import com.example.base.model.User;
import com.example.base.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ActiveUserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Хранилище активных пользователей: username -> время последней активности
    private final Map<String, Long> activeUsers = new ConcurrentHashMap<>();
    
    // Таймаут неактивности (30 минут)
    private static final long INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 минут в миллисекундах
    
    /**
     * Отметить пользователя как активного
     */
    public void markUserActive(String username) {
        activeUsers.put(username, System.currentTimeMillis());
    }
    
    /**
     * Удалить пользователя из списка активных
     */
    public void markUserInactive(String username) {
        activeUsers.remove(username);
    }
    
    /**
     * Проверить, активен ли пользователь
     */
    public boolean isUserActive(String username) {
        Long lastActivity = activeUsers.get(username);
        if (lastActivity == null) {
            return false;
        }
        
        // Проверяем, не истек ли таймаут неактивности
        long timeSinceLastActivity = System.currentTimeMillis() - lastActivity;
        if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            activeUsers.remove(username);
            return false;
        }
        
        return true;
    }
    
    /**
     * Получить список активных пользователей
     */
    public List<UserInfo> getActiveUsers() {
        // Очищаем неактивных пользователей
        cleanupInactiveUsers();
        
        List<UserInfo> activeUsersList = new ArrayList<>();
        
        for (String username : activeUsers.keySet()) {
            if (isUserActive(username)) {
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    activeUsersList.add(new UserInfo(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.isAdmin()
                    ));
                }
            }
        }
        
        return activeUsersList;
    }
    
    /**
     * Очистить неактивных пользователей
     */
    private void cleanupInactiveUsers() {
        long currentTime = System.currentTimeMillis();
        activeUsers.entrySet().removeIf(entry -> {
            long timeSinceLastActivity = currentTime - entry.getValue();
            return timeSinceLastActivity > INACTIVITY_TIMEOUT;
        });
    }
    
    /**
     * Получить количество активных пользователей
     */
    public int getActiveUsersCount() {
        cleanupInactiveUsers();
        return activeUsers.size();
    }
}

