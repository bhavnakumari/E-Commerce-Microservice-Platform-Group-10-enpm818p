package com.shop.users;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import static com.shop.users.UserDtos.RegisterRequest;
import static com.shop.users.UserDtos.UserResponse;
import static com.shop.users.UserDtos.LoginRequest;
import static com.shop.users.UserDtos.LoginResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "users"
        );
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody RegisterRequest request) {
        // basic validation
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()
                || request.fullName() == null || request.fullName().isBlank()) {
            throw new IllegalArgumentException("email, password, and fullName are required");
        }

        // check if email already exists
        userRepository.findByEmail(request.email())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Email already registered");
                });

        String hashed = passwordEncoder.encode(request.password());
        UserEntity entity = new UserEntity(
                request.email(),
                hashed,
                request.fullName(),
                Instant.now()
        );

        UserEntity saved = userRepository.save(entity);
        return UserResponse.fromEntity(saved);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("email and password are required");
        }

        var optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        UserEntity user = optionalUser.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Very simple opaque token (Base64 of userId:email:timestamp)
        String payload = user.getId() + ":" + user.getEmail() + ":" + Instant.now().getEpochSecond();
        String token = Base64.getEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

        return new LoginResponse(user.getId(), user.getEmail(), token);
    }
}