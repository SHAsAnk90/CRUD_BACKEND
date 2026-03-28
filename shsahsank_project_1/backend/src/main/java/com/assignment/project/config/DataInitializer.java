package com.assignment.project.config;

import com.assignment.project.models.ERole;
import com.assignment.project.models.User;
import com.assignment.project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@example.com", passwordEncoder.encode("admin123"));
            Set<ERole> roles = new HashSet<>();
            roles.add(ERole.ROLE_ADMIN);
            roles.add(ERole.ROLE_USER);
            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Default Admin User created: admin / admin123");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User("user", "user@example.com", passwordEncoder.encode("user123"));
            Set<ERole> roles = new HashSet<>();
            roles.add(ERole.ROLE_USER);
            user.setRoles(roles);
            userRepository.save(user);
            System.out.println("Default Standard User created: user / user123");
        }
    }
}
