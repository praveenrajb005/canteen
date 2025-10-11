package com.foodorder.service;

import com.foodorder.dto.OrderRequest;
import com.foodorder.entity.*;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private FoodService foodService;

    @Autowired
    private UserService userService;

    @Transactional
    public Order createOrder(OrderRequest orderRequest, String username) {
        User user = userService.findByUsername(username);
        
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setStatus(OrderStatus.PENDING);
        
        // Calculate total and create order items
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
            Food food = foodService.getFoodById(itemRequest.getFoodId());
            
            if (!food.getAvailable()) {
                throw new RuntimeException("Food item " + food.getName() + " is not available");
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFood(food);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(food.getPrice());
            orderItem.setSubtotal(food.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            
            orderItems.add(orderItem);
            total = total.add(orderItem.getSubtotal());
        }
        
        order.setTotalAmount(total);
        order.setOrderItems(orderItems);
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Save order items
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        
        return savedOrder;
    }

    public List<Order> getUserOrders(String username) {
        User user = userService.findByUsername(username);
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void cancelOrder(Long orderId, String username) {
        Order order = getOrderById(orderId);
        User user = userService.findByUsername(username);
        
        // Check if the order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own orders");
        }
        
        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel this order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
}