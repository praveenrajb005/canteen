-- Smart Canteen System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS smart_canteen;
USE smart_canteen;

-- Users table (includes both admin and regular users)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table (junction table for orders and products)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (username, email, password, phone, role) VALUES 
('admin', 'admin@canteen.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P3xnzUzPHNHcQy', '1234567890', 'ADMIN');
-- Default password is 'admin123' (hashed with BCrypt)

-- Insert sample products
INSERT INTO products (name, description, price, category, available) VALUES
('Chicken Biryani', 'Aromatic basmati rice with spiced chicken', 250.00, 'Main Course', TRUE),
('Vegetable Pulao', 'Fragrant rice with mixed vegetables', 180.00, 'Main Course', TRUE),
('Dal Tadka', 'Yellow lentils tempered with spices', 120.00, 'Curry', TRUE),
('Roti', 'Freshly made wheat bread', 15.00, 'Bread', TRUE),
('Naan', 'Soft leavened bread', 25.00, 'Bread', TRUE),
('Paneer Butter Masala', 'Cottage cheese in rich tomato gravy', 220.00, 'Curry', TRUE),
('Mixed Vegetable Curry', 'Seasonal vegetables in curry', 160.00, 'Curry', TRUE),
('Chicken Curry', 'Spiced chicken in gravy', 280.00, 'Curry', TRUE),
('Samosa', 'Crispy pastry with spiced filling', 30.00, 'Snacks', TRUE),
('Tea', 'Hot milk tea', 20.00, 'Beverages', TRUE),
('Coffee', 'Hot filter coffee', 25.00, 'Beverages', TRUE),
('Fresh Lime Soda', 'Refreshing lime drink', 35.00, 'Beverages', TRUE),
('Gulab Jamun', 'Sweet milk dumplings in syrup', 60.00, 'Desserts', TRUE),
('Ice Cream', 'Vanilla ice cream scoop', 40.00, 'Desserts', TRUE);

-- Insert sample regular user
INSERT INTO users (username, email, password, phone, role) VALUES 
('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9P3xnzUzPHNHcQy', '9876543210', 'USER');
-- Default password is 'admin123' (hashed with BCrypt)

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);
