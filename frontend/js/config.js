// Configuration settings for Smart Canteen Application

const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api', // Backend API base URL
    APP_NAME: 'Smart Canteen',
    VERSION: '1.0.0',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        
        // Products
        PRODUCTS: '/products',
        PRODUCTS_BY_CATEGORY: '/products/category',
        
        // Orders
        ORDERS: '/orders',
        USER_ORDERS: '/orders/user',
        ORDER_STATUS: '/orders/status',
        
        // Users (Admin only)
        USERS: '/users',
        ADMIN_STATS: '/admin/stats'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        USER_TOKEN: 'canteen_user_token',
        USER_DATA: 'canteen_user_data',
        CART_DATA: 'canteen_cart_data'
    },
    
    // Order Status
    ORDER_STATUS: {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        PREPARING: 'PREPARING',
        READY: 'READY',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED'
    },
    
    // User Roles
    USER_ROLES: {
        USER: 'USER',
        ADMIN: 'ADMIN'
    },
    
    // Categories
    CATEGORIES: [
        'Main Course',
        'Curry',
        'Bread',
        'Snacks',
        'Beverages',
        'Desserts'
    ]
};

// Utility functions
const Utils = {
    // Get full API URL
    getApiUrl: (endpoint) => {
        return CONFIG.API_BASE_URL + endpoint;
    },
    
    // Get data from localStorage
    getFromStorage: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    // Save data to localStorage
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    // Remove data from localStorage
    removeFromStorage: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },
    
    // Format currency
    formatCurrency: (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    },
    
    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Show loading state
    showLoading: (element) => {
        if (element) {
            element.disabled = true;
            element.classList.add('loading');
        }
    },
    
    // Hide loading state
    hideLoading: (element) => {
        if (element) {
            element.disabled = false;
            element.classList.remove('loading');
        }
    },
    
    // Show error message
    showError: (message, containerId = 'error-message') => {
        const errorContainer = document.getElementById(containerId);
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    },
    
    // Show success message
    showSuccess: (message, containerId = 'success-message') => {
        const successContainer = document.getElementById(containerId);
        if (successContainer) {
            successContainer.textContent = message;
            successContainer.style.display = 'block';
            setTimeout(() => {
                successContainer.style.display = 'none';
            }, 3000);
        }
    },
    
    // Validate email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone
    isValidPhone: (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }
};

// Make CONFIG and Utils available globally
window.CONFIG = CONFIG;
window.Utils = Utils;
