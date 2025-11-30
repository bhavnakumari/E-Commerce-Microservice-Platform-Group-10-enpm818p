package com.shop.orders;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static com.shop.orders.OrderDtos.CreateOrderRequest;
import static com.shop.orders.OrderDtos.PaymentInfo;
import java.util.List;


@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final UserClient userClient;

    public OrderService(OrderRepository orderRepository,
                        InventoryClient inventoryClient,
                        PaymentClient paymentClient,
                        UserClient userClient) {
        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
        this.paymentClient = paymentClient;
        this.userClient = userClient;
    }

    @Transactional
    public OrderEntity createOrder(CreateOrderRequest request) {
        if (request.userId() == null || request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("userId and at least one item are required");
        }

        PaymentInfo payment = request.payment();
        if (payment == null) {
            throw new IllegalArgumentException("payment information is required");
        }
        if (payment.amount() == null || payment.amount() <= 0) {
            throw new IllegalArgumentException("payment.amount must be > 0");
        }

        // 1. Charge payment first
        var payReq = new PaymentClient.PaymentRequest(
                request.userId(),
                payment.amount(),
                payment.currency() != null ? payment.currency() : "USD",
                payment.cardNumber(),
                payment.expiryMonth(),
                payment.expiryYear(),
                payment.cvv()
        );
        var payResp = paymentClient.charge(payReq);
        if (payResp == null || !"APPROVED".equalsIgnoreCase(payResp.status())) {
            throw new IllegalStateException("Payment failed: " +
                    (payResp != null ? payResp.reason() : "no response"));
        }

        // 2. Fetch user and address BEFORE inventory mutations
        var user = userClient.getUser(request.userId());
        if (user == null) {
            throw new IllegalStateException("User not found for id: " + request.userId());
        }


        // 3. Check stock for all items
        for (var item : request.items()) {
            if (item.quantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be > 0");
            }
            int available = inventoryClient.getStock(item.productId());
            if (available < item.quantity()) {
                throw new IllegalStateException("Insufficient stock for product " + item.productId());
            }
        }

        // 4. Decrement stock for all items
        for (var item : request.items()) {
            int available = inventoryClient.getStock(item.productId());
            int newQty = available - item.quantity();
            inventoryClient.setStock(item.productId(), newQty);
        }

        // 5. Persist order as CONFIRMED
        Instant now = Instant.now();
        OrderEntity order = new OrderEntity(
                request.userId(),
                "CONFIRMED",
                now,
                now
        );

        order.setStreet(user.street());
        order.setCity(user.city());
        order.setState(user.state());
        order.setPostalCode(user.postalCode());
        order.setCountry(user.country());

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

    public java.util.List<OrderEntity> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }
}