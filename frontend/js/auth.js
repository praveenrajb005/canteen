// Authentication Module for Smart Canteen Application

// Mock data for demo purposes (replace with actual API calls)
const MOCK_USERS = [
    { id: 1, username: 'admin', email: 'admin@canteen.com', password: 'admin123', role: 'ADMIN', phone: '9876543210' },
    { id: 2, username: 'user', email: 'user@canteen.com', password: 'user123', role: 'USER', phone: '9876543211' }
];

// Authentication functions
const Auth = {
    // Check if user is logged in
    isAuthenticated: () => {
        const token = Utils.getFromStorage(CONFIG.STORAGE_KEYS.USER_TOKEN);
        return !!token;
    },
    
    // Get current user
    getCurrentUser: () => {
        return Utils.getFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
    },
    
    // Login function
    login: async (username, password) => {
        try {
            // Mock API call - replace with actual API
            const user = MOCK_USERS.find(u => 
                (u.username === username || u.email === username) && 
                u.password === password
            );
            
            if (!user) {
                throw new Error('Invalid username or password');
            }
            
            // Generate mock token
            const token = btoa(JSON.stringify({
                userId: user.id,
                username: user.username,
                role: user.role,
                timestamp: Date.now()
            }));
            
            // Save to localStorage
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.USER_TOKEN, token);
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.USER_DATA, {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone
            });
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Register function
    register: async (userData) => {
        try {
            const { username, email, password, confirmPassword, phone } = userData;
            
            // Validation
            if (!username || username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }
            
            if (!Utils.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            if (!Utils.isValidPhone(phone)) {
                throw new Error('Please enter a valid 10-digit phone number');
            }
            
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Check if user already exists
            const existingUser = MOCK_USERS.find(u => 
                u.username === username || u.email === email || u.phone === phone
            );
            
            if (existingUser) {
                throw new Error('User with this username, email, or phone already exists');
            }
            
            // Create new user (mock)
            const newUser = {
                id: MOCK_USERS.length + 1,
                username,
                email,
                password,
                phone,
                role: 'USER'
            };
            
            MOCK_USERS.push(newUser);
            
            return {
                success: true,
                message: 'Registration successful! You can now login with your credentials.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Logout function
    logout: () => {
        Utils.removeFromStorage(CONFIG.STORAGE_KEYS.USER_TOKEN);
        Utils.removeFromStorage(CONFIG.STORAGE_KEYS.USER_DATA);
        Utils.removeFromStorage(CONFIG.STORAGE_KEYS.CART_DATA);
        window.location.href = 'login.html';
    }
};

// Initialize login functionality
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            if (!username || !password) {
                Utils.showError('Please fill in all fields');
                return;
            }
            
            Utils.showLoading(submitBtn);
            
            try {
                const result = await Auth.login(username, password);
                
                if (result.success) {
                    Utils.showSuccess('Login successful! Redirecting...');
                    
                    setTimeout(() => {
                        // Redirect based on user role
                        if (result.user.role === CONFIG.USER_ROLES.ADMIN) {
                            window.location.href = 'admin-dashboard.html';
                        } else {
                            window.location.href = 'user-dashboard.html';
                        }
                    }, 1000);
                } else {
                    Utils.showError(result.error);
                }
            } catch (error) {
                Utils.showError('An error occurred during login. Please try again.');
                console.error('Login error:', error);
            } finally {
                Utils.hideLoading(submitBtn);
            }
        });
    }
}

// Initialize registration functionality
function initializeRegister() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            
            Utils.showLoading(submitBtn);
            
            try {
                const result = await Auth.register(formData);
                
                if (result.success) {
                    Utils.showSuccess(result.message);
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    Utils.showError(result.error);
                }
            } catch (error) {
                Utils.showError('An error occurred during registration. Please try again.');
                console.error('Registration error:', error);
            } finally {
                Utils.hideLoading(submitBtn);
            }
        });
        
        // Password confirmation validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value && password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    }
}

// Check authentication for protected pages
function checkUserAuthentication() {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = Auth.getCurrentUser();
    if (user && user.role !== CONFIG.USER_ROLES.USER) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Check admin authentication for admin pages
function checkAdminAuthentication() {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = Auth.getCurrentUser();
    if (!user || user.role !== CONFIG.USER_ROLES.ADMIN) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Initialize logout functionality
function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                Auth.logout();
            }
        });
    }
}

// Update welcome message
function updateWelcomeMessage() {
    const user = Auth.getCurrentUser();
    if (user) {
        const welcomeElement = document.getElementById('welcome-user') || 
                             document.getElementById('welcome-admin');
        
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${user.username}!`;
        }
    }
}

// Check if user is already logged in (for login/register pages)
function checkIfAlreadyLoggedIn() {
    if (Auth.isAuthenticated()) {
        const user = Auth.getCurrentUser();
        if (user) {
            if (user.role === CONFIG.USER_ROLES.ADMIN) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }
    }
}

// Make Auth object available globally
window.Auth = Auth;

// Auto-initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'login.html':
            checkIfAlreadyLoggedIn();
            initializeLogin();
            break;
        case 'register.html':
            checkIfAlreadyLoggedIn();
            initializeRegister();
            break;
        case 'user-dashboard.html':
            if (checkUserAuthentication()) {
                updateWelcomeMessage();
                initializeLogout();
            }
            break;
        case 'admin-dashboard.html':
            if (checkAdminAuthentication()) {
                updateWelcomeMessage();
                initializeLogout();
            }
            break;
    }
});
