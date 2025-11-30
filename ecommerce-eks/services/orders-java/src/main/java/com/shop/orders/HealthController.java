package com.shop.orders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/orders")   // 👈 base path
public class HealthController {

    @GetMapping("/health")   // 👈 becomes /orders/health
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "orders-service");
        status.put("status", "UP");
        return status;
    }
}