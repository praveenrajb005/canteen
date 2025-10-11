package com.foodorder.controller;

import com.foodorder.entity.Food;
import com.foodorder.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping
    public ResponseEntity<List<Food>> getAllAvailableFoods() {
        List<Food> foods = foodService.getAvailableFoods();
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Food>> getFoodsByCategory(@PathVariable String category) {
        List<Food> foods = foodService.getFoodsByCategory(category);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFoodById(@PathVariable Long id) {
        try {
            Food food = foodService.getFoodById(id);
            return ResponseEntity.ok(food);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Food>> searchFoods(@RequestParam String name) {
        List<Food> foods = foodService.searchFoods(name);
        return ResponseEntity.ok(foods);
    }
}