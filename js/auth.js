// Authentication System
class Auth {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
        }
    }

    // Register new user
    register(userData) {
        const { name, email, phone, password } = userData;

        // Validate password confirmation
        if (userData.passwordConfirm !== password) {
            return { success: false, message: 'Les mots de passe ne correspondent pas' };
        }

        // Check if user already exists
        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Cet email est déjà utilisé' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            password: this.hashPassword(password), // Simple hash (in production, use proper hashing)
            createdAt: new Date().toISOString(),
            orders: []
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login
        this.login(email, password);

        return { success: true, message: 'Inscription réussie !', user: newUser };
    }

    // Login user
    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        }

        // Simple password check (in production, use proper hashing)
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        }

        // Set current user
        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return { success: true, message: 'Succesvol ingelogd!', user: this.currentUser };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get all users (for internal use)
    getAllUsers() {
        const usersStr = localStorage.getItem('users');
        return usersStr ? JSON.parse(usersStr) : [];
    }

    // Save order to user history
    saveOrder(orderData) {
        if (!this.isLoggedIn()) {
            return { success: false, message: 'Vous devez être connecté pour sauvegarder une commande' };
        }

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        const order = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: orderData.items || [],
            total: orderData.total || 0,
            status: 'completed',
            deliveryInfo: orderData.deliveryInfo || {}
        };

        users[userIndex].orders.push(order);
        users[userIndex].orders.sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, order };
    }

    // Get user orders
    getUserOrders() {
        if (!this.isLoggedIn()) {
            return [];
        }

        const users = this.getAllUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        return user ? user.orders : [];
    }

    // Simple password hash (for demo - use proper hashing in production)
    hashPassword(password) {
        // Simple hash for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
}

// Initialize auth system
window.auth = new Auth();

// Login/Register page handlers
document.addEventListener('DOMContentLoaded', function() {
    // Toggle between login and register forms
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Handle login form
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageEl = document.getElementById('loginMessage');

            const result = window.auth.login(email, password);
            
            if (result.success) {
                messageEl.textContent = result.message;
                messageEl.className = 'auth-message success';
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                messageEl.textContent = result.message;
                messageEl.className = 'auth-message error';
            }
        });
    }

    // Handle register form
    const registerFormElement = document.getElementById('registerFormElement');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const messageEl = document.getElementById('registerMessage');

            const result = window.auth.register({
                name,
                email,
                phone,
                password,
                passwordConfirm
            });
            
            if (result.success) {
                messageEl.textContent = result.message;
                messageEl.className = 'auth-message success';
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                messageEl.textContent = result.message;
                messageEl.className = 'auth-message error';
            }
        });
    }

    // Redirect if already logged in
    if (window.location.pathname.includes('login.html') && window.auth.isLoggedIn()) {
        window.location.href = 'profile.html';
    }
});
