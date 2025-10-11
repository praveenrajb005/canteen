// Global variables
const API_BASE_URL = 'http://localhost:8080/api';
let currentUser = null;
let authToken = null;
let cart = [];
let allFoods = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        updateNavigation();
        showFood();
        loadFoods();
    } else {
        showWelcome();
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Checkout form
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    
    // Add food form (admin)
    document.getElementById('add-food-form').addEventListener('submit', handleAddFood);
    
    // Search functionality
    document.getElementById('food-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchFood();
        }
    });
}

// Navigation functions
function showWelcome() {
    hideAllSections();
    document.getElementById('welcome-section').style.display = 'block';
}

function showLogin() {
    hideAllSections();
    document.getElementById('login-section').style.display = 'block';
    clearForm('login-form');
}

function showRegister() {
    hideAllSections();
    document.getElementById('register-section').style.display = 'block';
    clearForm('register-form');
}

function showFood() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllSections();
    document.getElementById('food-section').style.display = 'block';
    loadFoods();
}

function showOrders() {
    if (!currentUser) {
        showLogin();
        return;
    }
    hideAllSections();
    document.getElementById('orders-section').style.display = 'block';
    loadUserOrders();
}

function showAdmin() {
    if (!currentUser || currentUser.role !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        return;
    }
    hideAllSections();
    document.getElementById('admin-section').style.display = 'block';
    showAdminTab('foods');
}

function showCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    hideAllSections();
    document.getElementById('checkout-section').style.display = 'block';
    updateOrderSummary();
}

function backToMenu() {
    showFood();
}

function showHome() {
    if (currentUser) {
        showFood();
    } else {
        showWelcome();
    }
}

function hideAllSections() {
    const sections = ['welcome-section', 'login-section', 'register-section', 
                     'food-section', 'orders-section', 'admin-section', 'checkout-section'];
    sections.forEach(section => {
        document.getElementById(section).style.display = 'none';
    });
}

function clearForm(formId) {
    document.getElementById(formId).reset();
    // Clear error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            // Store in localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateNavigation();
            showFood();
            loadFoods();
        } else {
            document.getElementById('login-error').textContent = data.error || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').textContent = 'Network error. Please try again.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const fullName = document.getElementById('register-fullname').value;
    const address = document.getElementById('register-address').value;
    const phoneNumber = document.getElementById('register-phone').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, email, password, fullName, address, phoneNumber 
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please log in.');
            showLogin();
        } else {
            document.getElementById('register-error').textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-error').textContent = 'Network error. Please try again.';
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cart = [];
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateNavigation();
    showWelcome();
}

function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const ordersLink = document.getElementById('orders-link');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        ordersLink.style.display = 'block';
        
        if (currentUser.role === 'ADMIN') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        ordersLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Food functions
async function loadFoods() {
    try {
        const response = await fetch(`${API_BASE_URL}/foods`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            allFoods = await response.json();
            displayFoods(allFoods);
        } else {
            console.error('Failed to load foods');
        }
    } catch (error) {
        console.error('Error loading foods:', error);
    }
}

function displayFoods(foods) {
    const foodGrid = document.getElementById('food-grid');
    
    if (foods.length === 0) {
        foodGrid.innerHTML = '<div class="text-center">No food items available.</div>';
        return;
    }
    
    foodGrid.innerHTML = foods.map(food => `
        <div class="food-card">
            <img src="${food.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${food.name}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="food-card-content">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <div class="food-card-footer">
                    <span class="food-price">$${food.price.toFixed(2)}</span>
                    <button class="add-to-cart" 
                            onclick="addToCart(${food.id})"
                            ${!food.available ? 'disabled' : ''}>
                        ${food.available ? 'Add to Cart' : 'Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function searchFood() {
    const searchTerm = document.getElementById('food-search').value.trim();
    
    if (searchTerm === '') {
        displayFoods(allFoods);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/foods/search?name=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const foods = await response.json();
            displayFoods(foods);
        }
    } catch (error) {
        console.error('Error searching foods:', error);
    }
}

async function filterByCategory(category) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (category === '') {
        displayFoods(allFoods);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/foods/category/${category}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const foods = await response.json();
            displayFoods(foods);
        }
    } catch (error) {
        console.error('Error filtering foods:', error);
    }
}

// Cart functions
function addToCart(foodId) {
    const food = allFoods.find(f => f.id === foodId);
    if (!food) return;
    
    const existingItem = cart.find(item => item.food.id === foodId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ food, quantity: 1 });
    }
    
    updateCartDisplay();
}

function removeFromCart(foodId) {
    cart = cart.filter(item => item.food.id !== foodId);
    updateCartDisplay();
}

function updateCartQuantity(foodId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(foodId);
        return;
    }
    
    const item = cart.find(item => item.food.id === foodId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartSection = document.getElementById('cart-section');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartSection.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'block';
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const subtotal = item.food.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.food.name}</div>
                    <div class="cart-item-price">$${item.food.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.food.id}, ${item.quantity - 1})">-</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.food.id}, ${item.quantity + 1})">+</button>
                    <button class="btn-danger btn-small" onclick="removeFromCart(${item.food.id})" style="margin-left: 1rem;">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = total.toFixed(2);
}

// Order functions
async function handleCheckout(e) {
    e.preventDefault();
    
    const deliveryAddress = document.getElementById('delivery-address').value;
    
    const orderData = {
        deliveryAddress,
        items: cart.map(item => ({
            foodId: item.food.id,
            quantity: item.quantity
        }))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(orderData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Order placed successfully! Order ID: ${data.orderId}`);
            cart = [];
            updateCartDisplay();
            showOrders();
        } else {
            document.getElementById('checkout-error').textContent = data.error || 'Order failed';
        }
    } catch (error) {
        console.error('Checkout error:', error);
        document.getElementById('checkout-error').textContent = 'Network error. Please try again.';
    }
}

function updateOrderSummary() {
    const orderSummaryItems = document.getElementById('order-summary-items');
    const orderTotal = document.getElementById('order-total');
    
    let total = 0;
    orderSummaryItems.innerHTML = cart.map(item => {
        const subtotal = item.food.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="order-summary-item">
                <span>${item.food.name} × ${item.quantity}</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    
    orderTotal.textContent = total.toFixed(2);
}

async function loadUserOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        } else {
            document.getElementById('orders-list').innerHTML = '<div class="text-center">Failed to load orders.</div>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = '<div class="text-center">Network error.</div>';
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="text-center">No orders found.</div>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div>
                    <div class="order-date">${new Date(order.orderDate).toLocaleDateString()}</div>
                    <div class="order-total">$${order.totalAmount.toFixed(2)}</div>
                </div>
            </div>
            <div class="order-items">
                ${order.orderItems ? order.orderItems.map(item => `
                    <div class="order-item-detail">
                        <span>${item.food ? item.food.name : 'Unknown Item'} × ${item.quantity}</span>
                        <span>$${item.subtotal.toFixed(2)}</span>
                    </div>
                `).join('') : ''}
            </div>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            ${order.status === 'PENDING' ? `
                <button class="btn-danger" onclick="cancelOrder(${order.id})">Cancel Order</button>
            ` : ''}
        </div>
    `).join('');
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            alert('Order cancelled successfully!');
            loadUserOrders();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to cancel order');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Network error. Please try again.');
    }
}

// Admin functions
function showAdminTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show corresponding tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`admin-${tabName}`).style.display = 'block';
    
    // Load data for the active tab
    switch (tabName) {
        case 'foods':
            loadAdminFoods();
            break;
        case 'orders':
            loadAdminOrders();
            break;
        case 'users':
            loadAdminUsers();
            break;
    }
}

async function loadAdminFoods() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/foods`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const foods = await response.json();
            displayAdminFoods(foods);
        }
    } catch (error) {
        console.error('Error loading admin foods:', error);
    }
}

function displayAdminFoods(foods) {
    const adminFoodList = document.getElementById('admin-food-list');
    
    if (foods.length === 0) {
        adminFoodList.innerHTML = '<div class="text-center">No food items found.</div>';
        return;
    }
    
    adminFoodList.innerHTML = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${foods.map(food => `
                        <tr>
                            <td>${food.id}</td>
                            <td>${food.name}</td>
                            <td>$${food.price.toFixed(2)}</td>
                            <td>${food.category}</td>
                            <td>${food.available ? 'Yes' : 'No'}</td>
                            <td class="admin-actions-cell">
                                <button class="btn-warning btn-small" onclick="toggleFoodAvailability(${food.id})">
                                    ${food.available ? 'Disable' : 'Enable'}
                                </button>
                                <button class="btn-danger btn-small" onclick="deleteFood(${food.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const orders = await response.json();
            displayAdminOrders(orders);
        }
    } catch (error) {
        console.error('Error loading admin orders:', error);
    }
}

function displayAdminOrders(orders) {
    const adminOrderList = document.getElementById('admin-order-list');
    
    if (orders.length === 0) {
        adminOrderList.innerHTML = '<div class="text-center">No orders found.</div>';
        return;
    }
    
    adminOrderList.innerHTML = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.user ? order.user.fullName : 'Unknown'}</td>
                            <td>$${order.totalAmount.toFixed(2)}</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)">
                                    <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                                    <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                                    <option value="PREPARING" ${order.status === 'PREPARING' ? 'selected' : ''}>Preparing</option>
                                    <option value="READY" ${order.status === 'READY' ? 'selected' : ''}>Ready</option>
                                    <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                                    <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>
                                <button class="btn-info btn-small" onclick="viewOrderDetails(${order.id})">Details</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            const users = await response.json();
            displayAdminUsers(users);
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
    }
}

function displayAdminUsers(users) {
    const adminUserList = document.getElementById('admin-user-list');
    
    if (users.length === 0) {
        adminUserList.innerHTML = '<div class="text-center">No users found.</div>';
        return;
    }
    
    adminUserList.innerHTML = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.fullName}</td>
                            <td>${user.role}</td>
                            <td>
                                ${user.id !== currentUser.id ? `
                                    <button class="btn-danger btn-small" onclick="deleteUser(${user.id})">Delete</button>
                                ` : '<span>Current User</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Admin action functions
function showAddFoodForm() {
    document.getElementById('add-food-modal').style.display = 'flex';
}

function closeAddFoodModal() {
    document.getElementById('add-food-modal').style.display = 'none';
    clearForm('add-food-form');
}

async function handleAddFood(e) {
    e.preventDefault();
    
    const name = document.getElementById('food-name').value;
    const description = document.getElementById('food-description').value;
    const price = parseFloat(document.getElementById('food-price').value);
    const category = document.getElementById('food-category').value;
    const imageUrl = document.getElementById('food-image').value;
    
    const foodData = {
        name,
        description,
        price,
        category,
        imageUrl: imageUrl || null,
        available: true
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/foods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(foodData),
        });
        
        if (response.ok) {
            alert('Food added successfully!');
            closeAddFoodModal();
            loadAdminFoods();
            loadFoods(); // Refresh the main food list too
        } else {
            const data = await response.json();
            document.getElementById('add-food-error').textContent = data.error || 'Failed to add food';
        }
    } catch (error) {
        console.error('Error adding food:', error);
        document.getElementById('add-food-error').textContent = 'Network error. Please try again.';
    }
}

async function toggleFoodAvailability(foodId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/foods/${foodId}/toggle-availability`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            loadAdminFoods();
            loadFoods(); // Refresh the main food list too
        } else {
            alert('Failed to update food availability');
        }
    } catch (error) {
        console.error('Error toggling food availability:', error);
    }
}

async function deleteFood(foodId) {
    if (!confirm('Are you sure you want to delete this food item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/foods/${foodId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            alert('Food deleted successfully!');
            loadAdminFoods();
            loadFoods(); // Refresh the main food list too
        } else {
            alert('Failed to delete food');
        }
    } catch (error) {
        console.error('Error deleting food:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            // Order status updated successfully
            console.log('Order status updated');
        } else {
            alert('Failed to update order status');
            loadAdminOrders(); // Reload to reset the select value
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadAdminUsers();
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

function viewOrderDetails(orderId) {
    alert(`Order details for Order #${orderId} - Feature to be implemented`);
}