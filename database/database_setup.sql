-- Food Ordering Application Database Setup
-- Run this script in MySQL to create the database and insert sample data

-- Create database
CREATE DATABASE IF NOT EXISTS food_ordering_db;
USE food_ordering_db;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS users;

-- Create Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    address TEXT,
    phone_number VARCHAR(20),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Foods table
CREATE TABLE foods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    delivery_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Order Items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    food_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- Insert sample users
-- Password for all users is 'password123' (encoded with BCrypt)
INSERT INTO users (username, email, password, full_name, address, phone_number, role) VALUES
('admin', 'admin@foodorder.com', '$2a$10$H/XLkE6pE9TA3J3IzE8K.OxOGv5VhV5oS7NE7t5WKl0zBrKwCDMXe', 'System Administrator', '123 Admin Street, City, State', '+1234567890', 'ADMIN'),
('john_doe', 'john@example.com', '$2a$10$H/XLkE6pE9TA3J3IzE8K.OxOGv5VhV5oS7NE7t5WKl0zBrKwCDMXe', 'John Doe', '456 Main Street, City, State', '+1987654321', 'USER'),
('jane_smith', 'jane@example.com', '$2a$10$H/XLkE6pE9TA3J3IzE8K.OxOGv5VhV5oS7NE7t5WKl0zBrKwCDMXe', 'Jane Smith', '789 Oak Avenue, City, State', '+1122334455', 'USER');

-- Insert sample food items
INSERT INTO foods (name, description, price, category, image_url, available) VALUES
-- Appetizers
('Chicken Wings', 'Crispy chicken wings with your choice of sauce', 12.99, 'appetizer', 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=300', TRUE),
('Mozzarella Sticks', 'Golden fried mozzarella sticks served with marinara sauce', 8.99, 'appetizer', 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=300', TRUE),
('Nachos Supreme', 'Loaded nachos with cheese, jalapeños, and sour cream', 10.99, 'appetizer', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300', TRUE),
('Garlic Bread', 'Freshly baked bread with garlic butter and herbs', 5.99, 'appetizer', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300', TRUE),

-- Main Course
('Margherita Pizza', 'Classic pizza with fresh tomatoes, mozzarella, and basil', 16.99, 'main', 'https://images.unsplash.com/photo-1604382354936-07c5b6f67692?w=300', TRUE),
('Cheeseburger', 'Juicy beef patty with cheese, lettuce, tomato, and pickles', 14.99, 'main', 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300', TRUE),
('Grilled Salmon', 'Fresh salmon fillet grilled to perfection with lemon', 22.99, 'main', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', TRUE),
('Chicken Caesar Salad', 'Crisp romaine lettuce with grilled chicken and Caesar dressing', 13.99, 'main', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300', TRUE),
('Spaghetti Carbonara', 'Classic Italian pasta with eggs, cheese, and bacon', 15.99, 'main', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300', TRUE),
('BBQ Ribs', 'Tender pork ribs with our signature BBQ sauce', 19.99, 'main', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300', TRUE),

-- Desserts
('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 6.99, 'dessert', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300', TRUE),
('Cheesecake', 'New York style cheesecake with berry topping', 7.99, 'dessert', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300', TRUE),
('Ice Cream Sundae', 'Vanilla ice cream with hot fudge and whipped cream', 4.99, 'dessert', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', TRUE),
('Apple Pie', 'Traditional apple pie with cinnamon and sugar', 5.99, 'dessert', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=300', TRUE),

-- Beverages
('Coca Cola', 'Classic Coca Cola soft drink', 2.99, 'beverage', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300', TRUE),
('Orange Juice', 'Freshly squeezed orange juice', 3.99, 'beverage', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', TRUE),
('Coffee', 'Fresh brewed coffee', 2.49, 'beverage', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300', TRUE),
('Iced Tea', 'Refreshing iced tea with lemon', 2.79, 'beverage', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', TRUE),
('Milkshake', 'Creamy vanilla milkshake', 4.99, 'beverage', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300', TRUE);

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, status, delivery_address, order_date) VALUES
(2, 29.98, 'DELIVERED', '456 Main Street, City, State', '2024-10-08 12:30:00'),
(3, 45.97, 'PREPARING', '789 Oak Avenue, City, State', '2024-10-09 18:45:00'),
(2, 18.98, 'PENDING', '456 Main Street, City, State', '2024-10-09 19:15:00');

-- Insert sample order items
INSERT INTO order_items (order_id, food_id, quantity, price, subtotal) VALUES
-- Order 1 items
(1, 1, 2, 12.99, 25.98),
(1, 17, 1, 2.99, 2.99),
(1, 16, 1, 2.99, 2.99),

-- Order 2 items  
(2, 5, 2, 16.99, 33.98),
(2, 11, 1, 6.99, 6.99),
(2, 18, 1, 3.99, 3.99),

-- Order 3 items
(3, 6, 1, 14.99, 14.99),
(3, 17, 1, 2.99, 2.99),
(3, 16, 1, 2.99, 2.99);

-- Display summary
SELECT 'Database setup completed successfully!' as Status;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Foods' FROM foods;
SELECT COUNT(*) as 'Total Orders' FROM orders;
SELECT COUNT(*) as 'Total Order Items' FROM order_items;

-- Display sample data
SELECT '--- USERS ---' as Info;
SELECT id, username, email, full_name, role FROM users;

SELECT '--- FOODS BY CATEGORY ---' as Info;
SELECT category, COUNT(*) as count FROM foods GROUP BY category ORDER BY category;

SELECT '--- RECENT ORDERS ---' as Info;
SELECT o.id, u.full_name, o.total_amount, o.status, o.order_date 
FROM orders o 
JOIN users u ON o.user_id = u.id 
ORDER BY o.order_date DESC;