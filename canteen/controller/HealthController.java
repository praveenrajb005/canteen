package com.canteen.controller;

import com.canteen.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {
    
    @Autowired(required = false)
    private BuildProperties buildProperties;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("application", "Smart Canteen Backend");
        healthData.put("version", buildProperties != null ? buildProperties.getVersion() : "1.0.0");
        healthData.put("description", "Smart Canteen Management System Backend API");
        
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", healthData));
    }
}