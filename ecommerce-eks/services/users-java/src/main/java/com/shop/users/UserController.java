package com.shop.users;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Health check
    @GetMapping({"/health", "/users/health"})
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "users"
        );
    }

    // ---------- GET USER BY ID ----------

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(UserResponse.fromEntity(user)))
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message", "User not found: " + id
                        )));
    }

    // ---------- REGISTER ----------

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Field-level validation with 400 instead of exceptions

        if (request.email() == null || request.email().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "email",
                            "message", "Email is required"
                    ));
        }

        if (request.password() == null || request.password().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "password",
                            "message", "Password is required"
                    ));
        }

        if (request.fullName() == null || request.fullName().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "fullName",
                            "message", "Full name is required"
                    ));
        }

        boolean missingAddress =
                request.street() == null || request.street().isBlank()
                        || request.city() == null || request.city().isBlank()
                        || request.state() == null || request.state().isBlank()
                        || request.postalCode() == null || request.postalCode().isBlank()
                        || request.country() == null || request.country().isBlank();

        if (missingAddress) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "field", "address",
                            "message", "Address fields are required"
                    ));
        }

        // Duplicate email → 409 Conflict (instead of IllegalStateException)
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "field", "email",
                            "message", "Email already registered"
                    ));
        }

        // Create & save user
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
        UserResponse body = UserResponse.fromEntity(saved);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(body);
    }

    // ---------- LOGIN ----------

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        // Missing fields → 400 (no exceptions)
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message", "email and password are required"
                    ));
        }

        var optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            // Invalid email → 401
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Invalid credentials"
                    ));
        }

        UserEntity user = optionalUser.get();
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            // Wrong password → 401
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Invalid credentials"
                    ));
        }

        // Generate simple token (same logic as before)
        String payload = user.getId() + ":" + user.getEmail() + ":" + Instant.now().getEpochSecond();
        String token = Base64.getEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));

        LoginResponse response = new LoginResponse(user.getId(), user.getEmail(), token);
        return ResponseEntity.ok(response);
    }
}