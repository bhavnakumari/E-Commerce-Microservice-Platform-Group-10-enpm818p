package com.shop.orders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class UserClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public UserClient(RestTemplateBuilder builder,
                      @Value("${users.base-url:http://users:8080}") String baseUrl) {
        this.restTemplate = builder.build();
        this.baseUrl = baseUrl;
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
    ) {}

    public UserResponse getUser(Long userId) {
        return restTemplate.getForObject(
                baseUrl + "/api/users/" + userId,
                UserResponse.class
        );
    }
}