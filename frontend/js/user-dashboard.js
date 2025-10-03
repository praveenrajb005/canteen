// User Dashboard Module for Smart Canteen Application

// Mock products data
const MOCK_PRODUCTS = [
    { id: 1, name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken pieces', price: 180, category: 'Main Course', available: true },
    { id: 2, name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with paneer cubes', price: 160, category: 'Curry', available: true },
    { id: 3, name: 'Butter Naan', description: 'Soft and fluffy Indian bread with butter', price: 45, category: 'Bread', available: true },
    { id: 4, name: 'Samosa', description: 'Crispy triangular pastry with spiced potato filling', price: 25, category: 'Snacks', available: true },
    { id: 5, name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 20, category: 'Beverages', available: true },
    { id: 6, name: 'Gulab Jamun', description: 'Sweet milk dumplings in sugar syrup', price: 40, category: 'Desserts', available: true },
    { id: 7, name: 'Dal Tadka', description: 'Yellow lentils tempered with spices', price: 120, category: 'Curry', available: true },
    { id: 8, name: 'Roti', description: 'Whole wheat flatbread', price: 15, category: 'Bread', available: true },
    { id: 9, name: 'Vada Pav', description: 'Mumbai street food - spiced potato fritter in bread', price: 35, category: 'Snacks', available: true },
    { id: 10, name: 'Fresh Lime Soda', description: 'Refreshing lime drink with soda', price: 30, category: 'Beverages', available: true }
];

// Mock orders data
let MOCK_ORDERS = [];

// Cart management
const Cart = {
    items: [],
    
    // Initialize cart from localStorage
    init: () => {
        const savedCart = Utils.getFromStorage(CONFIG.STORAGE_KEYS.CART_DATA);
        if (savedCart && Array.isArray(savedCart)) {
            Cart.items = savedCart;
        }
        Cart.updateDisplay();
    },
    
    // Add item to cart
    addItem: (product, quantity = 1) => {
        const existingItem = Cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            Cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }
        
        Cart.saveToStorage();
        Cart.updateDisplay();
        Utils.showSuccess(`${product.name} added to cart!`);
    },
    
    // Remove item from cart
    removeItem: (productId) => {
        Cart.items = Cart.items.filter(item => item.id !== productId);
        Cart.saveToStorage();
        Cart.updateDisplay();
    },
    
    // Update item quantity
    updateQuantity: (productId, quantity) => {
        const item = Cart.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                Cart.removeItem(productId);
            } else {
                item.quantity = quantity;
                Cart.saveToStorage();
                Cart.updateDisplay();
            }
        }
    },
    
    // Get cart total
    getTotal: () => {
        return Cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Get cart item count
    getItemCount: () => {
        return Cart.items.reduce((count, item) => count + item.quantity, 0);
    },
    
    // Clear cart
    clear: () => {
        Cart.items = [];
        Cart.saveToStorage();
        Cart.updateDisplay();
    },
    
    // Save cart to localStorage
    saveToStorage: () => {
        Utils.saveToStorage(CONFIG.STORAGE_KEYS.CART_DATA, Cart.items);
    },
    
    // Update cart display
    updateDisplay: () => {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const totalAmount = document.getElementById('total-amount');
        const placeOrderBtn = document.getElementById('place-order-btn');
        
        if (cartCount) {
            cartCount.textContent = Cart.getItemCount();
        }
        
        if (totalAmount) {
            totalAmount.textContent = Cart.getTotal().toFixed(2);
        }
        
        if (placeOrderBtn) {
            placeOrderBtn.disabled = Cart.items.length === 0;
        }
        
        if (cartItems) {
            Cart.renderCartItems();
        }
    },
    
    // Render cart items
    renderCartItems: () => {
        const cartItems = document.getElementById('cart-items');
        
        if (Cart.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious items from the menu</p>
                </div>
            `;
            return;
        }
        
        cartItems.innerHTML = Cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${Utils.formatCurrency(item.price)} each</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn btn-danger" onclick="Cart.removeItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
};

// User Dashboard functionality
const UserDashboard = {
    currentCategory: 'all',
    
    // Initialize dashboard
    init: () => {
        Cart.init();
        UserDashboard.setupEventListeners();
        UserDashboard.loadProducts();
        UserDashboard.loadOrders();
    },
    
    // Setup event listeners
    setupEventListeners: () => {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                UserDashboard.showSection(section);
                
                // Update active state
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                UserDashboard.filterByCategory(category);
                
                // Update active state
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', UserDashboard.placeOrder);
        }
    },
    
    // Show specific section
    showSection: (sectionName) => {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    },
    
    // Load products
    loadProducts: () => {
        const productsGrid = document.getElementById('products-grid');
        
        if (productsGrid) {
            productsGrid.innerHTML = MOCK_PRODUCTS.map(product => `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <span class="product-price">${Utils.formatCurrency(product.price)}</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <span class="product-category">${product.category}</span>
                    <div class="product-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="UserDashboard.updateProductQuantity(${product.id}, -1)">-</button>
                            <span class="quantity-display" id="qty-${product.id}">1</span>
                            <button class="quantity-btn" onclick="UserDashboard.updateProductQuantity(${product.id}, 1)">+</button>
                        </div>
                        <button class="add-to-cart-btn" onclick="UserDashboard.addToCart(${product.id})" ${!product.available ? 'disabled' : ''}>
                            ${product.available ? 'Add to Cart' : 'Not Available'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },
    
    // Filter products by category
    filterByCategory: (category) => {
        UserDashboard.currentCategory = category;
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },
    
    // Update product quantity in UI
    updateProductQuantity: (productId, change) => {
        const qtyDisplay = document.getElementById(`qty-${productId}`);
        if (qtyDisplay) {
            let currentQty = parseInt(qtyDisplay.textContent);
            let newQty = Math.max(1, currentQty + change);
            qtyDisplay.textContent = newQty;
        }
    },
    
    // Add product to cart
    addToCart: (productId) => {
        const product = MOCK_PRODUCTS.find(p => p.id === productId);
        const qtyDisplay = document.getElementById(`qty-${productId}`);
        const quantity = qtyDisplay ? parseInt(qtyDisplay.textContent) : 1;
        
        if (product) {
            Cart.addItem(product, quantity);
            // Reset quantity to 1
            if (qtyDisplay) {
                qtyDisplay.textContent = '1';
            }
        }
    },
    
    // Place order
    placeOrder: async () => {
        if (Cart.items.length === 0) {
            Utils.showError('Your cart is empty');
            return;
        }
        
        const placeOrderBtn = document.getElementById('place-order-btn');
        const instructions = document.getElementById('instructions').value.trim();
        
        Utils.showLoading(placeOrderBtn);
        
        try {
            const user = Auth.getCurrentUser();
            const order = {
                id: MOCK_ORDERS.length + 1,
                userId: user.id,
                items: [...Cart.items],
                total: Cart.getTotal(),
                instructions: instructions || 'No special instructions',
                status: CONFIG.ORDER_STATUS.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            MOCK_ORDERS.push(order);
            
            // Clear cart
            Cart.clear();
            
            // Clear instructions
            document.getElementById('instructions').value = '';
            
            Utils.showSuccess('Order placed successfully! You can track it in the Orders section.');
            
            // Switch to orders section
            setTimeout(() => {
                UserDashboard.showSection('orders');
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-section="orders"]').classList.add('active');
                UserDashboard.loadOrders();
            }, 2000);
            
        } catch (error) {
            Utils.showError('Failed to place order. Please try again.');
            console.error('Order placement error:', error);
        } finally {
            Utils.hideLoading(placeOrderBtn);
        }
    },
    
    // Load user orders
    loadOrders: () => {
        const ordersList = document.getElementById('orders-list');
        
        if (ordersList) {
            const user = Auth.getCurrentUser();
            const userOrders = MOCK_ORDERS.filter(order => order.userId === user.id);
            
            if (userOrders.length === 0) {
                ordersList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No orders yet</h3>
                        <p>Place your first order from the menu</p>
                    </div>
                `;
                return;
            }
            
            ordersList.innerHTML = userOrders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-info">
                            <h3>Order #${order.id}</h3>
                            <p class="order-date">${Utils.formatDate(order.createdAt)}</p>
                        </div>
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    
                    <div class="order-items">
                        <h4>Items:</h4>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>${Utils.formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${order.instructions !== 'No special instructions' ? `
                        <div class="order-instructions">
                            <h4>Special Instructions:</h4>
                            <p>${order.instructions}</p>
                        </div>
                    ` : ''}
                    
                    <div class="order-total">
                        Total: ${Utils.formatCurrency(order.total)}
                    </div>
                </div>
            `).join('');
        }
    }
};

// Initialize user dashboard
function initializeUserDashboard() {
    UserDashboard.init();
}

// Make Cart and UserDashboard available globally
window.Cart = Cart;
window.UserDashboard = UserDashboard;
