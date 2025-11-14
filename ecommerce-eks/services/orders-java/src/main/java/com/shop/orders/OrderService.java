package com.shop.orders;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static com.shop.orders.OrderDtos.CreateOrderRequest;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;

    public OrderService(OrderRepository orderRepository, InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
    }

    @Transactional
    public OrderEntity createOrder(CreateOrderRequest request) {
        if (request.userId() == null || request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("userId and at least one item are required");
        }

        // 1. Check stock for all items
        for (var item : request.items()) {
            if (item.quantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be > 0");
            }
            int available = inventoryClient.getStock(item.productId());
            if (available < item.quantity()) {
                throw new IllegalStateException("Insufficient stock for product " + item.productId());
            }
        }

        // 2. Decrement stock for all items
        for (var item : request.items()) {
            int available = inventoryClient.getStock(item.productId());
            int newQty = available - item.quantity();
            inventoryClient.setStock(item.productId(), newQty);
        }

        // 3. Persist order
        Instant now = Instant.now();
        OrderEntity order = new OrderEntity(
                request.userId(),
                "CONFIRMED",
                now,
                now
        );

        for (var item : request.items()) {
            OrderItemEntity entityItem = new OrderItemEntity(
                    item.productId(),
                    item.quantity()
            );
            order.addItem(entityItem);
        }

        return orderRepository.save(order);
    }

    public OrderEntity getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }
}