package com.shop.orders;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.shop.orders.OrderDtos.CreateOrderRequest;
import static com.shop.orders.OrderDtos.OrderResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/orders")
public class OrdersController {

    private static final Logger logger = LoggerFactory.getLogger(OrdersController.class);

    private final OrderService orderService;

    public OrdersController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping({"/health", "/orders/health"})
    public Map<String, String> health() {
        logger.info("Health check called for orders-service");
        return Map.of(
            "status", "ok",
            "service", "orders"
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@RequestBody CreateOrderRequest request) {
        logger.info("Received createOrder request for userId={} amount={}",
                request.userId(), request.amount());

        var order = orderService.createOrder(request);

        logger.info("Order created successfully orderId={} userId={}",
                order.getId(), order.getUserId());

        return OrderResponse.fromEntity(order);
    }

    @GetMapping
    public java.util.List<OrderResponse> getAllOrders() {
        logger.info("Fetching all orders");
        var orders = orderService.getAllOrders();
        logger.info("Fetched {} orders", orders.size());
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        logger.info("Fetching order with id={}", id);
        var order = orderService.getOrder(id);
        logger.info("Order fetched id={} userId={}", order.getId(), order.getUserId());
        return OrderResponse.fromEntity(order);
    }

    @GetMapping("/user/{userId}")
    public java.util.List<OrderResponse> getOrdersByUserId(@PathVariable Long userId) {
        logger.info("Fetching orders for userId={}", userId);

        var orders = orderService.getOrdersByUserId(userId);
        logger.info("Fetched {} orders for userId={}", orders.size(), userId);
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

}