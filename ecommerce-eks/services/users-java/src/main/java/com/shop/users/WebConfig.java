package com.shop.users;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Frontend origins allowed
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                )
                // Methods allowed from the browser
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // Allow all headers
                .allowedHeaders("*")
                // If you don’t need cookies, can be false as well
                .allowCredentials(false)
                // Cache preflight result for 1 hour
                .maxAge(3600);
    }
}