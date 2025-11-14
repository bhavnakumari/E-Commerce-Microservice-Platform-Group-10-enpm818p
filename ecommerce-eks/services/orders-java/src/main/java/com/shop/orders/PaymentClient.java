package com.shop.orders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PaymentClient(RestTemplateBuilder builder,
                         @Value("${payment.base-url:http://payments:8000}") String baseUrl) {
        this.restTemplate = builder.build();
        this.baseUrl = baseUrl;
    }

    public record PaymentRequest(
            Long userId,
            double amount,
            String currency,
            String cardNumber,
            int expiryMonth,
            int expiryYear,
            String cvv
    ) {
    }

    public record PaymentResponse(
            String status,
            String transactionId,
            String reason
    ) {
    }

    public PaymentResponse charge(PaymentRequest request) {
        try {
            return restTemplate.postForObject(
                    baseUrl + "/api/payments/charge",
                    request,
                    PaymentResponse.class
            );
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to call payment service", ex);
        }
    }
}