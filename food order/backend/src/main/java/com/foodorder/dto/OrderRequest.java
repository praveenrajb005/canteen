package com.foodorder.dto;

import java.util.List;

public class OrderRequest {
    private String deliveryAddress;
    private List<OrderItemRequest> items;

    // Constructors
    public OrderRequest() {}

    public OrderRequest(String deliveryAddress, List<OrderItemRequest> items) {
        this.deliveryAddress = deliveryAddress;
        this.items = items;
    }

    // Getters and Setters
    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    // Inner class for order items
    public static class OrderItemRequest {
        private Long foodId;
        private Integer quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(Long foodId, Integer quantity) {
            this.foodId = foodId;
            this.quantity = quantity;
        }

        public Long getFoodId() {
            return foodId;
        }

        public void setFoodId(Long foodId) {
            this.foodId = foodId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}