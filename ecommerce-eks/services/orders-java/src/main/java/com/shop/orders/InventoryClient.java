package com.shop.orders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class InventoryClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public InventoryClient(RestTemplateBuilder builder,
                           @Value("${inventory.base-url:http://inventory:8000}") String baseUrl) {
        this.restTemplate = builder.build();
        this.baseUrl = baseUrl;
    }

    public record InventoryResponse(String productId, int quantity) {}

    public int getStock(String productId) {
        try {
            InventoryResponse resp = restTemplate.getForObject(
                    baseUrl + "/api/inventory/{productId}",
                    InventoryResponse.class,
                    productId
            );
            return resp != null ? resp.quantity() : 0;
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to call inventory service (getStock)", ex);
        }
    }

    public void setStock(String productId, int newQuantity) {
        try {
            var body = java.util.Map.of("quantity", newQuantity);
            restTemplate.put(
                    baseUrl + "/api/inventory/{productId}",
                    body,
                    productId
            );
        } catch (RestClientException ex) {
            throw new RuntimeException("Failed to call inventory service (setStock)", ex);
        }
    }
}