// Admin Dashboard Module for Smart Canteen Application

// Share the same mock data with user dashboard
// In a real application, this would be managed through API calls

// Admin Dashboard functionality
const AdminDashboard = {
    currentOrderFilter: 'all',
    
    // Initialize admin dashboard
    init: () => {
        AdminDashboard.setupEventListeners();
        AdminDashboard.loadDashboardStats();
        AdminDashboard.loadProducts();
        AdminDashboard.loadOrders();
        AdminDashboard.loadUsers();
        AdminDashboard.loadRecentOrders();
    },
    
    // Setup event listeners
    setupEventListeners: () => {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                AdminDashboard.showSection(section);
                
                // Update active state
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => AdminDashboard.showProductModal());
        }
        
        // Modal close button
        const closeModal = document.querySelector('.modal .close');
        if (closeModal) {
            closeModal.addEventListener('click', () => AdminDashboard.hideProductModal());
        }
        
        // Product form
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', AdminDashboard.handleProductSubmit);
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => AdminDashboard.hideProductModal());
        }
        
        // Order status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                AdminDashboard.currentOrderFilter = e.target.value;
                AdminDashboard.loadOrders();
            });
        }
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('product-modal');
            if (e.target === modal) {
                AdminDashboard.hideProductModal();
            }
        });
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
        
        // Load data when switching sections
        switch (sectionName) {
            case 'dashboard':
                AdminDashboard.loadDashboardStats();
                AdminDashboard.loadRecentOrders();
                break;
            case 'products':
                AdminDashboard.loadProducts();
                break;
            case 'orders':
                AdminDashboard.loadOrders();
                break;
            case 'users':
                AdminDashboard.loadUsers();
                break;
        }
    },
    
    // Load dashboard statistics
    loadDashboardStats: () => {
        // Get all orders from the shared MOCK_ORDERS
        const allOrders = window.MOCK_ORDERS || [];
        const pendingOrders = allOrders.filter(order => order.status === CONFIG.ORDER_STATUS.PENDING);
        const allUsers = window.MOCK_USERS || [];
        const allProducts = window.MOCK_PRODUCTS || [];
        
        // Update stats
        const totalOrders = document.getElementById('total-orders');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const totalProducts = document.getElementById('total-products');
        const totalUsers = document.getElementById('total-users');
        
        if (totalOrders) totalOrders.textContent = allOrders.length;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders.length;
        if (totalProducts) totalProducts.textContent = allProducts.length;
        if (totalUsers) totalUsers.textContent = allUsers.filter(u => u.role === 'USER').length;
    },
    
    // Load recent orders
    loadRecentOrders: () => {
        const recentOrdersList = document.getElementById('recent-orders-list');
        const allOrders = window.MOCK_ORDERS || [];
        
        if (recentOrdersList) {
            const recentOrders = allOrders.slice(-5).reverse(); // Get last 5 orders
            
            if (recentOrders.length === 0) {
                recentOrdersList.innerHTML = '<p>No recent orders</p>';
                return;
            }
            
            recentOrdersList.innerHTML = recentOrders.map(order => {
                const user = window.MOCK_USERS.find(u => u.id === order.userId) || { username: 'Unknown' };
                return `
                    <div class="recent-order-item">
                        <div class="recent-order-info">
                            <h4>Order #${order.id} - ${user.username}</h4>
                            <p>${Utils.formatDate(order.createdAt)}</p>
                        </div>
                        <div class="recent-order-amount">${Utils.formatCurrency(order.total)}</div>
                    </div>
                `;
            }).join('');
        }
    },
    
    // Load products table
    loadProducts: () => {
        const productsTable = document.getElementById('products-table');
        const allProducts = window.MOCK_PRODUCTS || [];
        
        if (productsTable) {
            if (allProducts.length === 0) {
                productsTable.innerHTML = `
                    <div class="table-empty">
                        <div class="table-empty-icon">📦</div>
                        <h3>No products found</h3>
                        <p>Add your first product using the button above</p>
                    </div>
                `;
                return;
            }
            
            productsTable.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allProducts.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>${Utils.formatCurrency(product.price)}</td>
                                <td>
                                    <label class="availability-toggle">
                                        <input type="checkbox" ${product.available ? 'checked' : ''} 
                                               onchange="AdminDashboard.toggleProductAvailability(${product.id})">
                                        <span class="availability-slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="action-btn action-btn-edit" onclick="AdminDashboard.editProduct(${product.id})">Edit</button>
                                        <button class="action-btn action-btn-delete" onclick="AdminDashboard.deleteProduct(${product.id})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },
    
    // Load orders table
    loadOrders: () => {
        const ordersTable = document.getElementById('orders-table');
        const allOrders = window.MOCK_ORDERS || [];
        
        if (ordersTable) {
            let filteredOrders = allOrders;
            if (AdminDashboard.currentOrderFilter !== 'all') {
                filteredOrders = allOrders.filter(order => order.status === AdminDashboard.currentOrderFilter);
            }
            
            if (filteredOrders.length === 0) {
                ordersTable.innerHTML = `
                    <div class="table-empty">
                        <div class="table-empty-icon">📋</div>
                        <h3>No orders found</h3>
                        <p>No orders match the current filter</p>
                    </div>
                `;
                return;
            }
            
            ordersTable.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredOrders.map(order => {
                            const user = window.MOCK_USERS.find(u => u.id === order.userId) || { username: 'Unknown' };
                            const itemsText = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
                            
                            return `
                                <tr>
                                    <td>#${order.id}</td>
                                    <td>${user.username}</td>
                                    <td title="${itemsText}">${order.items.length} items</td>
                                    <td>${Utils.formatCurrency(order.total)}</td>
                                    <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                                    <td>${Utils.formatDate(order.createdAt)}</td>
                                    <td>
                                        <div class="order-status-actions">
                                            ${AdminDashboard.getStatusButtons(order)}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    },
    
    // Get status buttons based on current order status
    getStatusButtons: (order) => {
        const buttons = [];
        
        switch (order.status) {
            case CONFIG.ORDER_STATUS.PENDING:
                buttons.push(`<button class="status-btn status-btn-confirm" onclick="AdminDashboard.updateOrderStatus(${order.id}, '${CONFIG.ORDER_STATUS.CONFIRMED}')">Confirm</button>`);
                buttons.push(`<button class="status-btn status-btn-cancel" onclick="AdminDashboard.updateOrderStatus(${order.id}, '${CONFIG.ORDER_STATUS.CANCELLED}')">Cancel</button>`);
                break;
            case CONFIG.ORDER_STATUS.CONFIRMED:
                buttons.push(`<button class="status-btn status-btn-prepare" onclick="AdminDashboard.updateOrderStatus(${order.id}, '${CONFIG.ORDER_STATUS.PREPARING}')">Start Preparing</button>`);
                break;
            case CONFIG.ORDER_STATUS.PREPARING:
                buttons.push(`<button class="status-btn status-btn-ready" onclick="AdminDashboard.updateOrderStatus(${order.id}, '${CONFIG.ORDER_STATUS.READY}')">Mark Ready</button>`);
                break;
            case CONFIG.ORDER_STATUS.READY:
                buttons.push(`<button class="status-btn status-btn-complete" onclick="AdminDashboard.updateOrderStatus(${order.id}, '${CONFIG.ORDER_STATUS.COMPLETED}')">Complete</button>`);
                break;
        }
        
        return buttons.join('');
    },
    
    // Load users table
    loadUsers: () => {
        const usersTable = document.getElementById('users-table');
        const allUsers = window.MOCK_USERS || [];
        
        if (usersTable) {
            const regularUsers = allUsers.filter(user => user.role === 'USER');
            
            if (regularUsers.length === 0) {
                usersTable.innerHTML = `
                    <div class="table-empty">
                        <div class="table-empty-icon">👥</div>
                        <h3>No users found</h3>
                        <p>No registered users yet</p>
                    </div>
                `;
                return;
            }
            
            usersTable.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${regularUsers.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${user.phone}</td>
                                <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                                <td>
                                    <div class="table-actions">
                                        <button class="action-btn action-btn-view" onclick="AdminDashboard.viewUser(${user.id})">View Orders</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },
    
    // Show product modal
    showProductModal: (productId = null) => {
        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('product-form');
        
        if (productId) {
            // Edit mode
            const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
            if (product) {
                modalTitle.textContent = 'Edit Product';
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description || '';
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-available').checked = product.available;
                form.dataset.productId = productId;
            }
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Product';
            form.reset();
            delete form.dataset.productId;
        }
        
        modal.style.display = 'block';
    },
    
    // Hide product modal
    hideProductModal: () => {
        const modal = document.getElementById('product-modal');
        modal.style.display = 'none';
    },
    
    // Handle product form submission
    handleProductSubmit: (e) => {
        e.preventDefault();
        
        const form = e.target;
        const productId = form.dataset.productId;
        const formData = new FormData(form);
        
        const productData = {
            name: formData.get('product-name') || document.getElementById('product-name').value,
            description: formData.get('product-description') || document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            available: document.getElementById('product-available').checked
        };
        
        // Validation
        if (!productData.name || !productData.category || !productData.price) {
            Utils.showError('Please fill in all required fields');
            return;
        }
        
        if (productId) {
            // Update existing product
            const productIndex = window.MOCK_PRODUCTS.findIndex(p => p.id === parseInt(productId));
            if (productIndex !== -1) {
                window.MOCK_PRODUCTS[productIndex] = {
                    ...window.MOCK_PRODUCTS[productIndex],
                    ...productData
                };
                Utils.showSuccess('Product updated successfully');
            }
        } else {
            // Add new product
            const newProduct = {
                id: Math.max(...window.MOCK_PRODUCTS.map(p => p.id), 0) + 1,
                ...productData
            };
            window.MOCK_PRODUCTS.push(newProduct);
            Utils.showSuccess('Product added successfully');
        }
        
        AdminDashboard.hideProductModal();
        AdminDashboard.loadProducts();
        AdminDashboard.loadDashboardStats();
    },
    
    // Toggle product availability
    toggleProductAvailability: (productId) => {
        const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
        if (product) {
            product.available = !product.available;
            Utils.showSuccess(`${product.name} ${product.available ? 'enabled' : 'disabled'}`);
        }
    },
    
    // Edit product
    editProduct: (productId) => {
        AdminDashboard.showProductModal(productId);
    },
    
    // Delete product
    deleteProduct: (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const productIndex = window.MOCK_PRODUCTS.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                const productName = window.MOCK_PRODUCTS[productIndex].name;
                window.MOCK_PRODUCTS.splice(productIndex, 1);
                Utils.showSuccess(`${productName} deleted successfully`);
                AdminDashboard.loadProducts();
                AdminDashboard.loadDashboardStats();
            }
        }
    },
    
    // Update order status
    updateOrderStatus: (orderId, newStatus) => {
        if (!window.MOCK_ORDERS) {
            window.MOCK_ORDERS = [];
        }
        
        const order = window.MOCK_ORDERS.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            Utils.showSuccess(`Order #${orderId} status updated to ${newStatus}`);
            AdminDashboard.loadOrders();
            AdminDashboard.loadDashboardStats();
            AdminDashboard.loadRecentOrders();
        }
    },
    
    // View user details (placeholder)
    viewUser: (userId) => {
        const user = window.MOCK_USERS.find(u => u.id === userId);
        const userOrders = window.MOCK_ORDERS ? window.MOCK_ORDERS.filter(o => o.userId === userId) : [];
        
        alert(`User: ${user.username}\nEmail: ${user.email}\nTotal Orders: ${userOrders.length}\nTotal Spent: ${Utils.formatCurrency(userOrders.reduce((sum, order) => sum + order.total, 0))}`);
    }
};

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Ensure shared data is available
    if (!window.MOCK_PRODUCTS) {
        window.MOCK_PRODUCTS = [];
    }
    if (!window.MOCK_ORDERS) {
        window.MOCK_ORDERS = [];
    }
    if (!window.MOCK_USERS) {
        window.MOCK_USERS = [
            { id: 1, username: 'admin', email: 'admin@canteen.com', password: 'admin123', role: 'ADMIN', phone: '9876543210' },
            { id: 2, username: 'user', email: 'user@canteen.com', password: 'user123', role: 'USER', phone: '9876543211' }
        ];
    }
    
    AdminDashboard.init();
}

// Make AdminDashboard available globally
window.AdminDashboard = AdminDashboard;
