package com.shop.orders;

import java.time.Instant;
import java.util.List;

public class OrderDtos {

    public record OrderItemRequest(
            String productId,
            int quantity
    ) {
    }

    public record PaymentInfo(
            Double amount,
            String cardNumber,
            Integer expiryMonth,
            Integer expiryYear,
            String cvv,
            String currency
    ) {
    }

    public record CreateOrderRequest(
            Long userId,
            List<OrderItemRequest> items,
            PaymentInfo payment
    ) {
    }

    public record OrderItemResponse(
            String productId,
            int quantity
    ) {
        public static OrderItemResponse fromEntity(OrderItemEntity entity) {
            return new OrderItemResponse(
                    entity.getProductId(),
                    entity.getQuantity()
            );
        }
    }

    public record OrderResponse(
            Long id,
            Long userId,
            String status,
            Instant createdAt,
            List<OrderItemResponse> items
    ) {
        public static OrderResponse fromEntity(OrderEntity entity) {
            List<OrderItemResponse> itemResponses = entity.getItems().stream()
                    .map(OrderItemResponse::fromEntity)
                    .toList();
            return new OrderResponse(
                    entity.getId(),
                    entity.getUserId(),
                    entity.getStatus(),
                    entity.getCreatedAt(),
                    itemResponses
            );
        }
    }
}