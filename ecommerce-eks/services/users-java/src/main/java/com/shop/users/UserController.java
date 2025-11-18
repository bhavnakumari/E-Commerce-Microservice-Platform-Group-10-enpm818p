package com.shop.users;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import static com.shop.users.UserDtos.RegisterRequest;
import static com.shop.users.UserDtos.UserResponse;
import static com.shop.users.UserDtos.LoginRequest;
import static com.shop.users.UserDtos.LoginResponse;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody RegisterRequest request) {
        // basic validation
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()
                || request.fullName() == null || request.fullName().isBlank()
                || request.street() == null || request.street().isBlank()
                || request.city() == null || request.city().isBlank()
                || request.state() == null || request.state().isBlank()
                || request.postalCode() == null || request.postalCode().isBlank()
                || request.country() == null || request.country().isBlank()) {
            throw new IllegalArgumentException("email, password, fullName, and address fields are required");
        }

        // check if email already exists
        userRepository.findByEmail(request.email())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Email already registered");
                });

        String hashed = passwordEncoder.encode(request.password());

        UserEntity entity = new UserEntity();
        entity.setEmail(request.email());
        entity.setPasswordHash(hashed);
        entity.setFullName(request.fullName());
        entity.setStreet(request.street());
        entity.setCity(request.city());
        entity.setState(request.state());
        entity.setPostalCode(request.postalCode());
        entity.setCountry(request.country());
        entity.setCreatedAt(Instant.now());

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

        String payload = user.getId() + ":" + user.getEmail() + ":" + Instant.now().getEpochSecond();
        String token = Base64.getEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

        return new LoginResponse(user.getId(), user.getEmail(), token);
    }
}