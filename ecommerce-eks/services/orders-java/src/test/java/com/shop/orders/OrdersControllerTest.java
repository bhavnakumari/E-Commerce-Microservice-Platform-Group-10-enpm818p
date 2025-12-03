package com.shop.orders;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static com.shop.orders.OrderDtos.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Orders Service REST API
 * Tests all CRUD operations and validation for CI/CD pipeline
 */
@WebMvcTest(OrdersController.class)
@DisplayName("Orders Controller Tests")
class OrdersControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    private OrderEntity sampleOrder;
    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        // Setup sample order entity
        sampleOrder = new OrderEntity();
        sampleOrder.setId(1L);
        sampleOrder.setUserId(100L);
        sampleOrder.setStatus("CONFIRMED");
        sampleOrder.setTotalAmount(99.99);
        sampleOrder.setCreatedAt(Instant.now());

        // Setup create order request
        OrderItemRequest item = new OrderItemRequest(
                "product-123",
                "Test Product",
                2,
                29.99
        );

        createOrderRequest = new CreateOrderRequest(
                100L,
                List.of(item),
                "123 Main St",
                "New York",
                "NY",
                "10001",
                "US"
        );
    }

    @Nested
    @DisplayName("Health Check Tests")
    class HealthCheckTests {

        @Test
        @DisplayName("Should return OK status for health check")
        void testHealthCheck() throws Exception {
            mockMvc.perform(get("/api/orders/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ok"))
                    .andExpect(jsonPath("$.service").value("orders"));
        }
    }

    @Nested
    @DisplayName("Create Order Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order with valid request")
        void testCreateOrderSuccess() throws Exception {
            when(orderService.createOrder(any(CreateOrderRequest.class)))
                    .thenReturn(sampleOrder);

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createOrderRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.userId").value(100))
                    .andExpect(jsonPath("$.status").value("CONFIRMED"))
                    .andExpect(jsonPath("$.totalAmount").value(99.99));
        }

        @Test
        @DisplayName("Should fail when user ID is missing")
        void testCreateOrderWithoutUserId() throws Exception {
            CreateOrderRequest invalidRequest = new CreateOrderRequest(
                    null,  // Missing userId
                    List.of(new OrderItemRequest("prod-1", "Product", 1, 10.0)),
                    "123 St", "City", "ST", "12345", "US"
            );

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail when items list is empty")
        void testCreateOrderWithEmptyItems() throws Exception {
            CreateOrderRequest invalidRequest = new CreateOrderRequest(
                    100L,
                    List.of(),  // Empty items
                    "123 St", "City", "ST", "12345", "US"
            );

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail when address fields are missing")
        void testCreateOrderWithInvalidAddress() throws Exception {
            CreateOrderRequest invalidRequest = new CreateOrderRequest(
                    100L,
                    List.of(new OrderItemRequest("prod-1", "Product", 1, 10.0)),
                    null,  // Missing street
                    "City",
                    "ST",
                    "12345",
                    "US"
            );

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle service errors gracefully")
        void testCreateOrderServiceError() throws Exception {
            when(orderService.createOrder(any(CreateOrderRequest.class)))
                    .thenThrow(new RuntimeException("Payment failed"));

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createOrderRequest)))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    @DisplayName("Get All Orders Tests")
    class GetAllOrdersTests {

        @Test
        @DisplayName("Should return all orders")
        void testGetAllOrders() throws Exception {
            OrderEntity order1 = new OrderEntity();
            order1.setId(1L);
            order1.setUserId(100L);
            order1.setStatus("CONFIRMED");
            order1.setTotalAmount(99.99);

            OrderEntity order2 = new OrderEntity();
            order2.setId(2L);
            order2.setUserId(101L);
            order2.setStatus("PENDING");
            order2.setTotalAmount(149.99);

            when(orderService.getAllOrders())
                    .thenReturn(Arrays.asList(order1, order2));

            mockMvc.perform(get("/api/orders"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[1].id").value(2));
        }

        @Test
        @DisplayName("Should return empty list when no orders exist")
        void testGetAllOrdersEmpty() throws Exception {
            when(orderService.getAllOrders())
                    .thenReturn(List.of());

            mockMvc.perform(get("/api/orders"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("Get Order By ID Tests")
    class GetOrderByIdTests {

        @Test
        @DisplayName("Should return order by ID")
        void testGetOrderById() throws Exception {
            when(orderService.getOrder(1L))
                    .thenReturn(sampleOrder);

            mockMvc.perform(get("/api/orders/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.userId").value(100))
                    .andExpect(jsonPath("$.status").value("CONFIRMED"));
        }

        @Test
        @DisplayName("Should return 404 when order not found")
        void testGetOrderByIdNotFound() throws Exception {
            when(orderService.getOrder(999L))
                    .thenThrow(new IllegalArgumentException("Order not found"));

            mockMvc.perform(get("/api/orders/999"))
                    .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Should handle invalid order ID format")
        void testGetOrderByIdInvalidFormat() throws Exception {
            mockMvc.perform(get("/api/orders/invalid"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Get Orders By User ID Tests")
    class GetOrdersByUserIdTests {

        @Test
        @DisplayName("Should return orders for specific user")
        void testGetOrdersByUserId() throws Exception {
            OrderEntity order1 = new OrderEntity();
            order1.setId(1L);
            order1.setUserId(100L);
            order1.setStatus("CONFIRMED");

            OrderEntity order2 = new OrderEntity();
            order2.setId(2L);
            order2.setUserId(100L);
            order2.setStatus("PENDING");

            when(orderService.getOrdersByUserId(100L))
                    .thenReturn(Arrays.asList(order1, order2));

            mockMvc.perform(get("/api/orders/user/100"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].userId").value(100))
                    .andExpect(jsonPath("$[1].userId").value(100));
        }

        @Test
        @DisplayName("Should return empty list for user with no orders")
        void testGetOrdersByUserIdEmpty() throws Exception {
            when(orderService.getOrdersByUserId(999L))
                    .thenReturn(List.of());

            mockMvc.perform(get("/api/orders/user/999"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should handle invalid user ID format")
        void testGetOrdersByUserIdInvalidFormat() throws Exception {
            mockMvc.perform(get("/api/orders/user/invalid"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("CORS Configuration Tests")
    class CorsTests {

        @Test
        @DisplayName("Should allow CORS from any origin")
        void testCorsAllowsAllOrigins() throws Exception {
            mockMvc.perform(options("/api/orders")
                            .header("Origin", "http://localhost:3000")
                            .header("Access-Control-Request-Method", "POST"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Request Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should reject malformed JSON")
        void testMalformedJson() throws Exception {
            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{invalid json"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject requests with null body")
        void testNullBody() throws Exception {
            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should validate item quantity is positive")
        void testInvalidItemQuantity() throws Exception {
            OrderItemRequest invalidItem = new OrderItemRequest(
                    "prod-1",
                    "Product",
                    -1,  // Negative quantity
                    10.0
            );

            CreateOrderRequest request = new CreateOrderRequest(
                    100L,
                    List.of(invalidItem),
                    "123 St", "City", "ST", "12345", "US"
            );

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should validate item price is positive")
        void testInvalidItemPrice() throws Exception {
            OrderItemRequest invalidItem = new OrderItemRequest(
                    "prod-1",
                    "Product",
                    1,
                    -10.0  // Negative price
            );

            CreateOrderRequest request = new CreateOrderRequest(
                    100L,
                    List.of(invalidItem),
                    "123 St", "City", "ST", "12345", "US"
            );

            mockMvc.perform(post("/api/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
