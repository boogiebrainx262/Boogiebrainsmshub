// State Management
let currentUser = null;
let userBalance = 0;
let products = [];
let cart = [];
let orders = [];
let walletHistory = [];
let paymentHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    checkUserAuth();
});

// Authentication
function setupEventListeners() {
    // Login/Register buttons
    document.getElementById('loginBtn').addEventListener('click', function() {
        openModal('loginModal');
    });

    document.getElementById('registerBtn').addEventListener('click', function() {
        openModal('registerModal');
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
    document.getElementById('fundWalletForm').addEventListener('submit', handleFundWallet);

    // Search and filter
    document.getElementById('productSearch').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('landingProductSearch').addEventListener('input', filterLandingProducts);
    document.getElementById('landingCategoryFilter').addEventListener('change', filterLandingProducts);

    // Hamburger menu
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        currentUser = {
            email: email,
            name: email.split('@')[0],
            balance: 0
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeModal('loginModal');
        showDashboard();
        loadUserData();
        
        alert('Login successful!');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (name && email && password) {
        currentUser = {
            email: email,
            name: name,
            balance: 0
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeModal('registerModal');
        showDashboard();
        loadUserData();
        
        alert('Registration successful!');
    }
}

function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match!');
        return;
    }

    alert('Password changed successfully!');
    document.getElementById('changePasswordForm').reset();
}

function handleFundWallet(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('fundAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (amount > 0 && paymentMethod) {
        alert(`Redirecting to ${paymentMethod.toUpperCase()} for payment of ₦${amount}`);
        
        setTimeout(() => {
            currentUser.balance += amount;
            userBalance = currentUser.balance;
            walletHistory.push({
                date: new Date().toLocaleDateString(),
                amount: amount,
                type: 'Credit',
                status: 'Success'
            });
            paymentHistory.push({
                date: new Date().toLocaleDateString(),
                amount: amount,
                status: 'Success'
            });
            updateDashboard();
            document.getElementById('fundWalletForm').reset();
        }, 2000);
    }
}

function checkUserAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        loadUserData();
    }
}

function loadUserData() {
    if (currentUser) {
        document.getElementById('userEmail').textContent = currentUser.email;
        userBalance = currentUser.balance || 0;
        updateDashboard();
    }
}

function updateDashboard() {
    document.getElementById('walletBalance').textContent = `₦${userBalance.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;
    document.getElementById('statBalance').textContent = `₦${userBalance.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;
    document.getElementById('statOrders').textContent = orders.length;
    
    const totalDeposits = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('statDeposits').textContent = `₦${totalDeposits.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;

    updateWalletHistoryTable();
    updatePaymentHistoryTable();
    updateOrdersTable();
}

function updateWalletHistoryTable() {
    const tbody = document.getElementById('walletHistoryTable');
    if (walletHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No transactions yet</td></tr>';
        return;
    }

    tbody.innerHTML = walletHistory.map(entry => `
        <tr>
            <td>${entry.date}</td>
            <td>₦${entry.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            <td>${entry.type}</td>
            <td><span class="status-${entry.status.toLowerCase()}">${entry.status}</span></td>
        </tr>
    `).join('');
}

function updatePaymentHistoryTable() {
    const tbody = document.getElementById('paymentHistoryTable');
    if (paymentHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No payments yet</td></tr>';
        return;
    }

    tbody.innerHTML = paymentHistory.map(entry => `
        <tr>
            <td>${entry.date}</td>
            <td>₦${entry.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            <td><span class="status-${entry.status.toLowerCase()}">${entry.status}</span></td>
        </tr>
    `).join('');
}

function updateOrdersTable() {
    const tbody = document.getElementById('ordersTable');
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.productName}</td>
            <td>₦${order.amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}</td>
            <td>${order.date}</td>
            <td><span class="status-${order.status.toLowerCase()}">${order.status}</span></td>
        </tr>
    `).join('');
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    userBalance = 0;
    hideDashboard();
    alert('Logged out successfully!');
}

// Dashboard Navigation
function showDashboard() {
    document.getElementById('landingPageContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    showDashboardTab('dashboard');
}

function hideDashboard() {
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('landingPageContainer').style.display = 'block';
}

function showDashboardTab(tabName) {
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });

    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    event.target.closest('.sidebar-link')?.classList.add('active');

    if (tabName === 'products') {
        loadDashboardProducts();
    }
}

// Products Management
function loadProducts() {
    products = [
        {
            id: 1,
            name: 'Facebook Account - Standard',
            category: 'facebook',
            price: 5000,
            description: 'Standard Facebook account with verified email',
            quantity: 10
        },
        {
            id: 2,
            name: 'Facebook Account - Premium',
            category: 'facebook',
            price: 8000,
            description: 'Premium Facebook account with marketplace access',
            quantity: 5
        },
        {
            id: 3,
            name: 'Instagram Account',
            category: 'instagram',
            price: 6000,
            description: 'Instagram account ready for business',
            quantity: 8
        },
        {
            id: 4,
            name: 'Twitter Account',
            category: 'twitter',
            price: 4000,
            description: 'Twitter account with followers',
            quantity: 12
        },
        {
            id: 5,
            name: 'TikTok Account',
            category: 'tiktok',
            price: 7000,
            description: 'TikTok account with engagement',
            quantity: 7
        },
        {
            id: 6,
            name: 'Email Verification Service',
            category: 'other',
            price: 2000,
            description: 'SMS/Email verification service',
            quantity: 20
        }
    ];

    displayLandingProducts();
}

function displayLandingProducts() {
    const grid = document.getElementById('landingProductsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₦${product.price.toLocaleString('en-NG')}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="document.getElementById('loginBtn').click()">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function loadDashboardProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₦${product.price.toLocaleString('en-NG')}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Buy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        facebook: 'facebook',
        instagram: 'instagram',
        twitter: 'twitter',
        tiktok: 'tiktok',
        other: 'box'
    };
    return icons[category] || 'box';
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const grid = document.getElementById('productsGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found</div>';
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₦${product.price.toLocaleString('en-NG')}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Buy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterLandingProducts() {
    const searchTerm = document.getElementById('landingProductSearch').value.toLowerCase();
    const category = document.getElementById('landingCategoryFilter').value;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const grid = document.getElementById('landingProductsGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found</div>';
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₦${product.price.toLocaleString('en-NG')}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Add
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="document.getElementById('loginBtn').click()">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        alert(`${product.name} added to cart!`);
    }
}

function buyProduct(productId) {
    if (!currentUser) {
        alert('Please login to make a purchase');
        openModal('loginModal');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (userBalance < product.price) {
        alert('Insufficient wallet balance. Please fund your wallet first.');
        showDashboardTab('wallet');
        return;
    }

    userBalance -= product.price;
    currentUser.balance = userBalance;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const order = {
        id: Date.now(),
        productName: product.name,
        amount: product.price,
        date: new Date().toLocaleDateString(),
        status: 'Completed'
    };
    orders.push(order);

    updateDashboard();
    alert('Purchase successful! Product details sent to your email.');
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeModal('loginModal');
    }
    if (event.target === registerModal) {
        closeModal('registerModal');
    }
}