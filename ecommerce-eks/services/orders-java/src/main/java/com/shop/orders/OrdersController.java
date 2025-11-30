package com.shop.orders;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.shop.orders.OrderDtos.CreateOrderRequest;
import static com.shop.orders.OrderDtos.OrderResponse;

@RestController
@CrossOrigin(origins = "*")
public class OrdersController {

    private final OrderService orderService;

    public OrdersController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/health, /orders/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "orders"
        );
    }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@RequestBody CreateOrderRequest request) {
        var order = orderService.createOrder(request);
        return OrderResponse.fromEntity(order);
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        var order = orderService.getOrder(id);
        return OrderResponse.fromEntity(order);
    }

    @GetMapping("/api/orders/user/{userId}")
    public java.util.List<OrderResponse> getOrdersByUserId(@PathVariable Long userId) {
        var orders = orderService.getOrdersByUserId(userId);
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }
}