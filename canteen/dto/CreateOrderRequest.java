package com.canteen.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateOrderRequest {
    
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;
    
    @Size(max = 500, message = "Special instructions must be less than 500 characters")
    private String specialInstructions;
    
    // Constructors
    public CreateOrderRequest() {}
    
    public CreateOrderRequest(List<OrderItemRequest> items, String specialInstructions) {
        this.items = items;
        this.specialInstructions = specialInstructions;
    }
    
    // Getters and Setters
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    @Override
    public String toString() {
        return "CreateOrderRequest{" +
                "items=" + items +
                ", specialInstructions='" + specialInstructions + '\'' +
                '}';
    }
}