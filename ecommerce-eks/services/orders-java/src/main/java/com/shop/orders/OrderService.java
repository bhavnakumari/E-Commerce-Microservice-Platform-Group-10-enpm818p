package com.shop.orders;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import static com.shop.orders.OrderDtos.CreateOrderRequest;
import static com.shop.orders.OrderDtos.PaymentInfo;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
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

        logger.info("Starting order creation for userId={} with {} items",
                request.userId(),
                request.items() != null ? request.items().size() : 0);

        if (request.userId() == null || request.items() == null || request.items().isEmpty()) {
            logger.error("Invalid order request: userId or items missing");
            throw new IllegalArgumentException("userId and at least one item are required");
        }

        PaymentInfo payment = request.payment();
        if (payment == null) {
            logger.error("Payment info missing for userId={}", request.userId());
            throw new IllegalArgumentException("payment information is required");
        }
        if (payment.amount() == null || payment.amount() <= 0) {
            logger.error("Invalid payment amount={} for userId={}", payment.amount(), request.userId());
            throw new IllegalArgumentException("payment.amount must be > 0");
        }

        // -------------------- 1. PAYMENT --------------------
        logger.info("Charging payment for userId={} amount={} {}",
                request.userId(),
                payment.amount(),
                payment.currency() != null ? payment.currency() : "USD");

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
            logger.error("Payment FAILED for userId={} reason={}",
                    request.userId(),
                    (payResp != null ? payResp.reason() : "no response"));
            throw new IllegalStateException("Payment failed: " +
                    (payResp != null ? payResp.reason() : "no response"));
        }

        logger.info("Payment APPROVED for userId={} transactionId={}",
                request.userId(),
                payResp.transactionId());

        // -------------------- 2. USER LOOKUP --------------------
        logger.info("Fetching user details for userId={}", request.userId());

        // 2. Fetch user and address BEFORE inventory mutations
        var user = userClient.getUser(request.userId());
        if (user == null) {
            logger.error("User not found for id={}", request.userId());
            throw new IllegalStateException("User not found for id: " + request.userId());
        }

        logger.info("User lookup successful: userId={} city={} state={}",
                user.id(),
                user.city(),
                user.state());

        // -------------------- 3. STOCK CHECK --------------------
        logger.info("Checking stock for {} items for userId={}",
                request.items().size(),
                request.userId());

        // 3. Check stock for all items
        for (var item : request.items()) {
            if (item.quantity() <= 0) {
                logger.error("Invalid quantity={} for productId={} userId={}",
                        item.quantity(),
                        item.productId(),
                        request.userId());
                throw new IllegalArgumentException("Item quantity must be > 0");
            }
            int available = inventoryClient.getStock(item.productId());

            logger.debug("Stock check: productId={} available={} needed={}",
                    item.productId(), available, item.quantity());

            if (available < item.quantity()) {
                logger.error("Insufficient stock for product={} needed={} available={}",
                        item.productId(), item.quantity(), available);
                throw new IllegalStateException("Insufficient stock for product " + item.productId());
            }
        }

        logger.info("Stock check PASSED for all items userId={}", request.userId());

        // -------------------- 4. DECREMENT STOCK --------------------
        logger.info("Decrementing stock for {} items userId={}",
                request.items().size(),
                request.userId());


        // 4. Decrement stock for all items
        for (var item : request.items()) {
            int available = inventoryClient.getStock(item.productId());
            int newQty = available - item.quantity();

            logger.debug("Updating stock: productId={} oldQty={} newQty={}",
                    item.productId(), available, newQty);

            inventoryClient.setStock(item.productId(), newQty);
        }
        logger.info("Stock decrement COMPLETE for userId={}", request.userId());

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
        logger.info("Saving order for userId={} with {} items",
                request.userId(),
                request.items().size());

        OrderEntity savedOrder = orderRepository.save(order);

        logger.info("Order saved successfully orderId={} userId={}",
                savedOrder.getId(),
                savedOrder.getUserId());

        return orderRepository.save(order);
    }

    public OrderEntity getOrder(Long id) {
        logger.info("Fetching orderId={}", id);
        return orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Order not found orderId={}", id);
                    return new IllegalArgumentException("Order not found: " + id);
                });
    }

    public List<OrderEntity> getOrdersByUserId(Long userId) {
        logger.info("Fetching orders for userId={}", userId);
        List<OrderEntity> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        logger.info("Found {} orders for userId={}", orders.size(), userId);
        return orders;
    }

    public List<OrderEntity> getAllOrders() {
        logger.info("Fetching ALL orders");
        List<OrderEntity> orders = orderRepository.findAll();
        logger.info("Total orders fetched={}", orders.size());
        return orders;
    }
}