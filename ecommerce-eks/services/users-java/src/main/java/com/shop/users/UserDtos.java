package com.shop.users;

public class UserDtos {

    public record RegisterRequest(
            String email,
            String password,
            String fullName,
            String street,
            String city,
            String state,
            String postalCode,
            String country
    ) {
    }

    public record UserResponse(
            Long id,
            String email,
            String fullName,
            String street,
            String city,
            String state,
            String postalCode,
            String country
    ) {
        public static UserResponse fromEntity(UserEntity entity) {
            return new UserResponse(
                    entity.getId(),
                    entity.getEmail(),
                    entity.getFullName(),
                    entity.getStreet(),
                    entity.getCity(),
                    entity.getState(),
                    entity.getPostalCode(),
                    entity.getCountry()
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