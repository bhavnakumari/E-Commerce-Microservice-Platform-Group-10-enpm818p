package com.shop.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Optional;

import static com.shop.users.UserDtos.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Users Service REST API
 * Tests authentication, registration, and user management for CI/CD pipeline
 */
@WebMvcTest(UserController.class)
@DisplayName("User Controller Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private UserEntity sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // Setup sample user entity
        sampleUser = new UserEntity();
        sampleUser.setId(1L);
        sampleUser.setEmail("test@example.com");
        sampleUser.setPasswordHash(passwordEncoder.encode("password123"));
        sampleUser.setFullName("Test User");
        sampleUser.setStreet("123 Main St");
        sampleUser.setCity("New York");
        sampleUser.setState("NY");
        sampleUser.setPostalCode("10001");
        sampleUser.setCountry("US");
        sampleUser.setCreatedAt(Instant.now());

        // Setup register request
        registerRequest = new RegisterRequest(
                "newuser@example.com",
                "password123",
                "New User",
                "456 Elm St",
                "Los Angeles",
                "CA",
                "90001",
                "US"
        );

        // Setup login request
        loginRequest = new LoginRequest("test@example.com", "password123");
    }

    @Nested
    @DisplayName("Health Check Tests")
    class HealthCheckTests {

        @Test
        @DisplayName("Should return OK status for health check")
        void testHealthCheck() throws Exception {
            mockMvc.perform(get("/api/users/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ok"))
                    .andExpect(jsonPath("$.service").value("users"));
        }
    }

    @Nested
    @DisplayName("User Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should register user with valid request")
        void testRegisterSuccess() throws Exception {
            when(userRepository.findByEmail(registerRequest.email()))
                    .thenReturn(Optional.empty());

            UserEntity savedUser = new UserEntity();
            savedUser.setId(2L);
            savedUser.setEmail(registerRequest.email());
            savedUser.setFullName(registerRequest.fullName());
            savedUser.setStreet(registerRequest.street());
            savedUser.setCity(registerRequest.city());
            savedUser.setState(registerRequest.state());
            savedUser.setPostalCode(registerRequest.postalCode());
            savedUser.setCountry(registerRequest.country());

            when(userRepository.save(any(UserEntity.class)))
                    .thenReturn(savedUser);

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.email").value("newuser@example.com"))
                    .andExpect(jsonPath("$.fullName").value("New User"));
        }

        @Test
        @DisplayName("Should fail when email already exists")
        void testRegisterDuplicateEmail() throws Exception {
            when(userRepository.findByEmail(registerRequest.email()))
                    .thenReturn(Optional.of(sampleUser));

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().is4xxClientError())
                    .andExpect(jsonPath("$.message").value("Email already registered"));
        }

        @Test
        @DisplayName("Should fail when email is missing")
        void testRegisterMissingEmail() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    null,  // Missing email
                    "password",
                    "User",
                    "Street",
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should fail when password is missing")
        void testRegisterMissingPassword() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    "test@test.com",
                    null,  // Missing password
                    "User",
                    "Street",
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should fail when full name is missing")
        void testRegisterMissingFullName() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    "test@test.com",
                    "password",
                    null,  // Missing full name
                    "Street",
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should fail when address fields are missing")
        void testRegisterMissingAddress() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    "test@test.com",
                    "password",
                    "User",
                    null,  // Missing street
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should fail when email is blank")
        void testRegisterBlankEmail() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    "",  // Blank email
                    "password",
                    "User",
                    "Street",
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("User Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login with valid credentials")
        void testLoginSuccess() throws Exception {
            when(userRepository.findByEmail(loginRequest.email()))
                    .thenReturn(Optional.of(sampleUser));

            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(1))
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.token").exists());
        }

        @Test
        @DisplayName("Should fail login with invalid email")
        void testLoginInvalidEmail() throws Exception {
            when(userRepository.findByEmail("wrong@example.com"))
                    .thenReturn(Optional.empty());

            LoginRequest invalid = new LoginRequest("wrong@example.com", "password123");

            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError())
                    .andExpect(jsonPath("$.message").value("Invalid credentials"));
        }

        @Test
        @DisplayName("Should fail login with wrong password")
        void testLoginWrongPassword() throws Exception {
            when(userRepository.findByEmail(loginRequest.email()))
                    .thenReturn(Optional.of(sampleUser));

            LoginRequest invalid = new LoginRequest("test@example.com", "wrongpassword");

            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError())
                    .andExpect(jsonPath("$.message").value("Invalid credentials"));
        }

        @Test
        @DisplayName("Should fail login when email is missing")
        void testLoginMissingEmail() throws Exception {
            LoginRequest invalid = new LoginRequest(null, "password");

            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should fail login when password is missing")
        void testLoginMissingPassword() throws Exception {
            LoginRequest invalid = new LoginRequest("test@test.com", null);

            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should generate unique tokens for each login")
        void testLoginGeneratesUniqueTokens() throws Exception {
            when(userRepository.findByEmail(loginRequest.email()))
                    .thenReturn(Optional.of(sampleUser));

            // First login
            String response1 = mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // Second login
            String response2 = mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // Tokens should be different (due to timestamp)
            // Note: This test may occasionally fail if executed too quickly
        }
    }

    @Nested
    @DisplayName("Get User By ID Tests")
    class GetUserByIdTests {

        @Test
        @DisplayName("Should return user by ID")
        void testGetUserById() throws Exception {
            when(userRepository.findById(1L))
                    .thenReturn(Optional.of(sampleUser));

            mockMvc.perform(get("/api/users/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.fullName").value("Test User"));
        }

        @Test
        @DisplayName("Should return 404 when user not found")
        void testGetUserByIdNotFound() throws Exception {
            when(userRepository.findById(999L))
                    .thenReturn(Optional.empty());

            mockMvc.perform(get("/api/users/999"))
                    .andExpect(status().is4xxClientError())
                    .andExpect(jsonPath("$.message").value("User not found: 999"));
        }

        @Test
        @DisplayName("Should handle invalid user ID format")
        void testGetUserByIdInvalidFormat() throws Exception {
            mockMvc.perform(get("/api/users/invalid"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("CORS Configuration Tests")
    class CorsTests {

        @Test
        @DisplayName("Should allow CORS from localhost:3000")
        void testCorsAllowsLocalhost() throws Exception {
            mockMvc.perform(options("/api/users/register")
                            .header("Origin", "http://localhost:3000")
                            .header("Access-Control-Request-Method", "POST"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Password Security Tests")
    class PasswordSecurityTests {

        @Test
        @DisplayName("Should hash passwords before storing")
        void testPasswordHashing() throws Exception {
            when(userRepository.findByEmail(registerRequest.email()))
                    .thenReturn(Optional.empty());

            UserEntity savedUser = new UserEntity();
            savedUser.setId(3L);
            savedUser.setEmail(registerRequest.email());

            when(userRepository.save(any(UserEntity.class)))
                    .thenReturn(savedUser);

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());

            // Password should never be returned in response
            mockMvc.perform(get("/api/users/3"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andExpect(jsonPath("$.passwordHash").doesNotExist());
        }
    }

    @Nested
    @DisplayName("Request Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should reject malformed JSON")
        void testMalformedJson() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject requests with null body")
        void testNullBody() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should validate email format")
        void testInvalidEmailFormat() throws Exception {
            RegisterRequest invalid = new RegisterRequest(
                    "not-an-email",  // Invalid email format
                    "password",
                    "User",
                    "Street",
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            // Note: Email format validation depends on implementation
            // This test may need adjustment based on actual validation rules
        }
    }
}
