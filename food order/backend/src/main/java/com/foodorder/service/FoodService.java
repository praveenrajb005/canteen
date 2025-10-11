package com.foodorder.service;

import com.foodorder.entity.Food;
import com.foodorder.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    public List<Food> getAvailableFoods() {
        return foodRepository.findByAvailableTrue();
    }

    public List<Food> getFoodsByCategory(String category) {
        return foodRepository.findByCategoryAndAvailableTrue(category);
    }

    public Food getFoodById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));
    }

    public Food createFood(Food food) {
        return foodRepository.save(food);
    }

    public Food updateFood(Long id, Food updatedFood) {
        Food food = getFoodById(id);
        food.setName(updatedFood.getName());
        food.setDescription(updatedFood.getDescription());
        food.setPrice(updatedFood.getPrice());
        food.setCategory(updatedFood.getCategory());
        food.setImageUrl(updatedFood.getImageUrl());
        food.setAvailable(updatedFood.getAvailable());
        
        return foodRepository.save(food);
    }

    public void deleteFood(Long id) {
        foodRepository.deleteById(id);
    }

    public List<Food> searchFoods(String name) {
        return foodRepository.findByNameContainingIgnoreCase(name);
    }

    public void toggleAvailability(Long id) {
        Food food = getFoodById(id);
        food.setAvailable(!food.getAvailable());
        foodRepository.save(food);
    }
}