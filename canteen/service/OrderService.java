package com.canteen.service;

import com.canteen.model.Order;
import com.canteen.model.OrderItem;
import com.canteen.model.Product;
import com.canteen.model.User;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.ProductRepository;
import com.canteen.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SmsService smsService;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
    }

    public Order createOrder(Long userId, List<OrderRequest> orderRequests, String specialInstructions) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Order order = new Order();
        order.setUser(user);
        order.setSpecialInstructions(specialInstructions);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest request : orderRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

            if (!product.getAvailable()) {
                throw new RuntimeException("Product is not available: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(request.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Send SMS notification when order is ready
        if (newStatus == Order.OrderStatus.READY && previousStatus != Order.OrderStatus.READY) {
            try {
                String message = String.format("Your order #%d is ready for pickup! Please collect it from the canteen.", orderId);
                smsService.sendSms(order.getUser().getPhone(), message);
            } catch (Exception e) {
                // Log error but don't fail the order update
                System.err.println("Failed to send SMS notification: " + e.getMessage());
            }
        }

        return savedOrder;
    }

    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // Only allow cancellation by the user who placed the order
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own orders");
        }

        // Only allow cancellation if order is not yet being prepared
        if (order.getStatus() == Order.OrderStatus.PREPARING || 
            order.getStatus() == Order.OrderStatus.READY || 
            order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel order. Order is already being prepared or completed.");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<Order> getTodaysOrders() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return getOrdersByDateRange(startOfDay, endOfDay);
    }

    public BigDecimal getTodaysRevenue() {
        List<Order> todaysOrders = getTodaysOrders();
        return todaysOrders.stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Long getTodaysOrderCount() {
        return (long) getTodaysOrders().size();
    }

    // Inner class for order request
    public static class OrderRequest {
        private Long productId;
        private Integer quantity;

        public OrderRequest() {}

        public OrderRequest(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
