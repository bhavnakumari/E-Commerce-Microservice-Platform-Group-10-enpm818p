package com.shop.users;

public class UserDtos {

    public record RegisterRequest(
            String email,
            String password,
            String fullName
    ) {
    }

    public record UserResponse(
            Long id,
            String email,
            String fullName
    ) {
        public static UserResponse fromEntity(UserEntity entity) {
            return new UserResponse(
                    entity.getId(),
                    entity.getEmail(),
                    entity.getFullName()
            );
        }
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }

    public record LoginResponse(
            Long userId,
            String email,
            String token
    ) {
    }
}