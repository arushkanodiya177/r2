/* ============================================================
   ÉCLAT – Premium Restaurant Website & Management System
   script.js – All logic, authentication, dashboards, interactions
   ============================================================ */

/* ---------- Data & State Management ---------- */
const STORAGE_KEYS = {
  USERS: 'eclat_users',
  DISHES: 'eclat_dishes',
  ORDERS: 'eclat_orders',
  RESERVATIONS: 'eclat_reservations',
  SETTINGS: 'eclat_settings',
  STAFF: 'eclat_staff',
  SESSION: 'eclat_session',
  FAVOURITES: 'eclat_favourites',
};

// Default demo accounts
const DEFAULT_USERS = [
  { id: 'u1', name: 'Alice Customer', email: 'alice@example.com', password: 'password123', role: 'customer' },
  { id: 'u2', name: 'Bob Customer', email: 'bob@example.com', password: 'password123', role: 'customer' },
  { id: 'k1', name: 'Chef Marco', email: 'marco@eclat.com', password: 'kitchen123', role: 'kitchen' },
  { id: 'k2', name: 'Sous Chef Lena', email: 'lena@eclat.com', password: 'kitchen123', role: 'kitchen' },
  { id: 'a1', name: 'Admin', email: 'admin@eclat.com', password: 'admin123', role: 'admin' },
];

// Default dishes
const DEFAULT_DISHES = [
  { id: 'd1', name: 'Truffle Risotto', price: 32, category: 'mains', description: 'Creamy arborio rice with black truffle and parmesan.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80', available: true },
  { id: 'd2', name: 'Seared Foie Gras', price: 28, category: 'starters', description: 'Pan-seared foie gras with fig compote and brioche.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', available: true },
  { id: 'd3', name: 'Chocolate Fondant', price: 18, category: 'desserts', description: 'Warm chocolate cake with molten center, vanilla ice cream.', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80', available: true },
  { id: 'd4', name: 'Lobster Thermidor', price: 42, category: 'mains', description: 'Lobster with creamy cognac sauce and gruyère crust.', image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80', available: true },
  { id: 'd5', name: 'Caesar Salad', price: 16, category: 'starters', description: 'Crisp romaine, parmesan, croutons, house dressing.', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80', available: true },
  { id: 'd6', name: 'Crème Brûlée', price: 14, category: 'desserts', description: 'Classic vanilla bean custard with caramelized sugar.', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&q=80', available: true },
  { id: 'd7', name: 'Wagyu Burger', price: 36, category: 'mains', description: 'Wagyu beef patty, brie, caramelized onion, truffle aioli.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', available: true },
  { id: 'd8', name: 'Elderflower Spritz', price: 12, category: 'drinks', description: 'Elderflower liqueur, prosecco, soda, mint.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80', available: true },
];

const DEFAULT_SETTINGS = {
  name: 'Éclat',
  contact: '+33 1 42 60 38 30',
  hours: 'Mon–Sun: 12:00 – 22:30',
  delivery: 5,
  tax: 10,
  address: '12 Rue de la Paix, 75002 Paris',
};

/* ---------- Utility Functions ---------- */
function generateId(prefix = 'id') {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}
function getCurrentDateTimeString() {
  return new Date().toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadFromStorage(key, fallback) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

/* ---------- Initialize Default Data (if not present) ---------- */
function initAppData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISHES)) {
    saveToStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    // Create demo orders
    const now = new Date();
    const demoOrders = [
      {
        id: 'ORD-1001',
        userId: 'u1',
        customerName: 'Alice Customer',
        items: [{ dishId: 'd1', name: 'Truffle Risotto', price: 32, qty: 1 }],
        total: 32,
        orderType: 'dine-in',
        specialInstructions: 'Extra parmesan please',
        status: 'new',
        createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
      },
      {
        id: 'ORD-1002',
        userId: 'u2',
        customerName: 'Bob Customer',
        items: [{ dishId: 'd4', name: 'Lobster Thermidor', price: 42, qty: 2 }],
        total: 84,
        orderType: 'delivery',
        specialInstructions: '',
        status: 'preparing',
        createdAt: new Date(now.getTime() - 25 * 60000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      },
    ];
    saveToStorage(STORAGE_KEYS.ORDERS, demoOrders);
  }
}

/* ---------- Authentication & Session ---------- */
function getSession() {
  return loadFromStorage(STORAGE_KEYS.SESSION, null);
}
function setSession(user) {
  saveToStorage(STORAGE_KEYS.SESSION, user);
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
function getUsers() { return loadFromStorage(STORAGE_KEYS.USERS, []); }
function saveUsers(users) { saveToStorage(STORAGE_KEYS.USERS, users); }

/* ---------- Page Navigation ---------- */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  // Reinit lucide icons
  if (window.lucide) lucide.createIcons();
}

/* ---------- Landing Page Logic ---------- */
function renderLandingMenu() {
  const dishes = loadFromStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES).filter(d => d.available);
  const grid = document.getElementById('landingMenuGrid');
  if (!grid) return;
  grid.innerHTML = dishes.slice(0, 6).map(dish => `
    <div class="menu-card">
      <img src="${dish.image}" alt="${dish.name}" loading="lazy" />
      <div class="menu-card-body">
        <h3>${dish.name}</h3>
        <span class="price">${formatCurrency(dish.price)}</span>
        <p class="desc">${dish.description}</p>
      </div>
    </div>
  `).join('');
}

/* ---------- Login & Registration Flows ---------- */
function openLogin(role = 'customer') {
  const loginPage = document.getElementById('login-page');
  const loginTitle = document.getElementById('loginTitle');
  const loginSubtitle = document.getElementById('loginSubtitle');
  const registerPrompt = document.getElementById('registerPrompt');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  
  document.getElementById('loginRole').value = role;
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  
  if (role === 'customer') {
    loginTitle.textContent = 'Customer Login';
    loginSubtitle.textContent = 'Access your Éclat experience';
    registerPrompt.style.display = 'block';
  } else if (role === 'kitchen') {
    loginTitle.textContent = 'Kitchen Staff Login';
    loginSubtitle.textContent = 'Kitchen Display System';
    registerPrompt.style.display = 'none';
  } else if (role === 'admin') {
    loginTitle.textContent = 'Admin Login';
    loginSubtitle.textContent = 'Restaurant Management';
    registerPrompt.style.display = 'none';
  }
  
  showPage('login-page');
  if (window.lucide) lucide.createIcons();
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const role = document.getElementById('loginRole').value;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password && u.role === role);
  
  if (!user) {
    showToast('Invalid credentials or role mismatch.', 'error');
    return;
  }
  
  setSession(user);
  showToast('Logged in successfully!', 'success');
  
  if (role === 'customer') {
    showPage('customer-dashboard');
    initCustomerDashboard(user);
  } else if (role === 'kitchen') {
    showPage('kitchen-dashboard');
    initKitchenDashboard();
  } else if (role === 'admin') {
    showPage('admin-dashboard');
    initAdminDashboard();
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('registerRole').value;
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }
  
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showToast('Email already registered.', 'error');
    return;
  }
  
  const newUser = {
    id: generateId('u'),
    name,
    email,
    password,
    role: 'customer',
  };
  users.push(newUser);
  saveUsers(users);
  
  setSession(newUser);
  showToast('Account created!', 'success');
  showPage('customer-dashboard');
  initCustomerDashboard(newUser);
}

/* ---------- CUSTOMER DASHBOARD ---------- */
let customerState = {
  currentUser: null,
  cart: [],
};

function initCustomerDashboard(user) {
  customerState.currentUser = user;
  customerState.cart = [];
  document.getElementById('customerGreeting').textContent = 'Welcome, ' + user.name;
  document.getElementById('customerDateTime').textContent = getCurrentDateTimeString();
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
  
  setupCustomerTabs();
  renderCustomerMenu();
  renderCustomerHome();
  renderCustomerCart();
  renderCustomerOrders();
  
  // Nav tabs
  document.querySelectorAll('[data-customer-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-customer-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.customer-tab').forEach(t => t.classList.remove('active'));
      const target = document.getElementById('cust-tab-' + tab.dataset.customerTab);
      if (target) target.classList.add('active');
      if (tab.dataset.customerTab === 'home') renderCustomerHome();
      if (tab.dataset.customerTab === 'menu') renderCustomerMenu();
      if (tab.dataset.customerTab === 'cart') renderCustomerCart();
      if (tab.dataset.customerTab === 'orders') renderCustomerOrders();
    });
  });
  
  // Logout
  document.getElementById('customerLogout').addEventListener('click', () => {
    clearSession();
    showPage('landing-page');
    showToast('Logged out.', 'info');
  });
  
  // Place order
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
  
  // Update profile
  document.getElementById('updateProfileBtn').addEventListener('click', () => {
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    if (!name || !email) { showToast('Name and email required.', 'error'); return; }
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].email = email;
      saveUsers(users);
      user.name = name;
      user.email = email;
      setSession(user);
      customerState.currentUser = user;
      document.getElementById('customerGreeting').textContent = 'Welcome, ' + name;
      showToast('Profile updated.', 'success');
    }
  });
  
  // Search & filter menu
  document.getElementById('dishSearch').addEventListener('input', renderCustomerMenu);
  document.getElementById('categoryFilter').addEventListener('change', renderCustomerMenu);
}

function renderCustomerHome() {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const userOrders = orders.filter(o => o.userId === customerState.currentUser.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const recent = userOrders.slice(0, 3);
  const active = userOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const favourites = loadFromStorage(STORAGE_KEYS.FAVOURITES + '_' + customerState.currentUser.id, []);
  
  document.getElementById('recentOrdersList').innerHTML = recent.length ? recent.map(o => `
    <div class="order-history-item">
      <span>${o.id}</span>
      <span class="badge" style="background:${o.status==='completed'?'#2ecc71':'#f5b041'}">${o.status}</span>
      <span>${formatCurrency(o.total)}</span>
    </div>
  `).join('') : '<div class="empty-state">No recent orders.</div>';
  
  document.getElementById('activeOrdersList').innerHTML = active.length ? active.map(o => `
    <div class="order-history-item">
      <span>${o.id}</span>
      <span class="badge" style="background:#e67e22">${o.status}</span>
      <span>${formatCurrency(o.total)}</span>
    </div>
  `).join('') : '<div class="empty-state">No active orders.</div>';
  
  document.getElementById('favouriteDishesList').innerHTML = favourites.length ? favourites.map(name => `
    <div class="order-history-item"><span>${name}</span></div>
  `).join('') : '<div class="empty-state">No favourites yet.</div>';
}

function renderCustomerMenu() {
  const dishes = loadFromStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES).filter(d => d.available);
  const search = (document.getElementById('dishSearch').value || '').toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  
  let filtered = dishes.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search);
    const matchCat = category === 'all' || d.category === category;
    return matchSearch && matchCat;
  });
  
  const grid = document.getElementById('customerMenuGrid');
  if (!grid) return;
  grid.innerHTML = filtered.length ? filtered.map(dish => `
    <div class="menu-card">
      <img src="${dish.image}" alt="${dish.name}" loading="lazy" />
      <div class="menu-card-body">
        <h3>${dish.name}</h3>
        <span class="price">${formatCurrency(dish.price)}</span>
        <p class="desc">${dish.description}</p>
        <button class="btn btn-gold btn-sm add-to-cart" data-dish-id="${dish.id}">Add to Cart</button>
      </div>
    </div>
  `).join('') : '<div class="empty-state">No dishes found.</div>';
  
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.dataset.dishId;
      const dish = dishes.find(d => d.id === dishId);
      if (!dish) return;
      addToCart(dish);
    });
  });
}

function addToCart(dish) {
  const existing = customerState.cart.find(i => i.dishId === dish.id);
  if (existing) {
    existing.qty += 1;
  } else {
    customerState.cart.push({ dishId: dish.id, name: dish.name, price: dish.price, qty: 1 });
  }
  renderCustomerCart();
  updateCartBadge();
  showToast(dish.name + ' added to cart.', 'success');
}

function renderCustomerCart() {
  const container = document.getElementById('cartItemsList');
  if (!container) return;
  if (customerState.cart.length === 0) {
    container.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    document.getElementById('cartTotal').textContent = '$0.00';
    return;
  }
  container.innerHTML = customerState.cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${formatCurrency(item.price)} x ${item.qty}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="decrease" data-idx="${idx}">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" data-action="increase" data-idx="${idx}">+</button>
        <button class="qty-btn" data-action="remove" data-idx="${idx}" style="color:#e74c3c;">✕</button>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === 'increase') customerState.cart[idx].qty += 1;
      else if (action === 'decrease') {
        customerState.cart[idx].qty -= 1;
        if (customerState.cart[idx].qty <= 0) customerState.cart.splice(idx, 1);
      } else if (action === 'remove') customerState.cart.splice(idx, 1);
      renderCustomerCart();
      updateCartBadge();
    });
  });
  
  const total = customerState.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = formatCurrency(total);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = customerState.cart.reduce((s, i) => s + i.qty, 0);
}

function placeOrder() {
  if (customerState.cart.length === 0) {
    showToast('Cart is empty.', 'error');
    return;
  }
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  const specialInstructions = document.getElementById('specialInstructions').value.trim();
  const total = customerState.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  
  const order = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    userId: customerState.currentUser.id,
    customerName: customerState.currentUser.name,
    items: customerState.cart.map(i => ({ dishId: i.dishId, name: i.name, price: i.price, qty: i.qty })),
    total: total,
    orderType: orderType,
    specialInstructions: specialInstructions,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  orders.push(order);
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
  
  // Add to favourites (demo: first item in order becomes favourite)
  if (customerState.cart.length > 0) {
    const favKey = STORAGE_KEYS.FAVOURITES + '_' + customerState.currentUser.id;
    const favs = loadFromStorage(favKey, []);
    customerState.cart.forEach(i => { if (!favs.includes(i.name)) favs.push(i.name); });
    saveToStorage(favKey, favs.slice(0, 5));
  }
  
  customerState.cart = [];
  renderCustomerCart();
  updateCartBadge();
  document.getElementById('specialInstructions').value = '';
  showToast('Order placed successfully!', 'success');
  renderCustomerHome();
  renderCustomerOrders();
  // Switch to orders tab
  document.querySelector('[data-customer-tab="orders"]').click();
}

function renderCustomerOrders() {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const userOrders = orders.filter(o => o.userId === customerState.currentUser.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const container = document.getElementById('orderHistoryList');
  if (!container) return;
  container.innerHTML = userOrders.length ? userOrders.map(o => `
    <div class="order-history-item">
      <div>
        <strong>${o.id}</strong><br/>
        <span style="font-size:0.8rem;color:var(--muted);">${new Date(o.createdAt).toLocaleString()}</span>
      </div>
      <span class="badge" style="background:${o.status==='completed'?'#2ecc71':o.status==='cancelled'?'#e74c3c':'#f5b041'}">${o.status}</span>
      <span>${formatCurrency(o.total)}</span>
      <span style="font-size:0.8rem;color:var(--muted);">${o.orderType}</span>
    </div>
  `).join('') : '<div class="empty-state">No orders yet.</div>';
}

/* ---------- KITCHEN DASHBOARD ---------- */
function initKitchenDashboard() {
  document.getElementById('kitchenDateTime').textContent = getCurrentDateTimeString();
  
  // Tabs
  document.querySelectorAll('[data-kitchen-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-kitchen-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.kitchen-tab').forEach(t => t.classList.remove('active'));
      const target = document.getElementById('kitchen-tab-' + tab.dataset.kitchenTab);
      if (target) target.classList.add('active');
      renderKitchenOrders();
    });
  });
  
  // Logout
  document.getElementById('kitchenLogout').addEventListener('click', () => {
    clearSession();
    showPage('landing-page');
    showToast('Logged out.', 'info');
  });
  
  renderKitchenOrders();
}

function renderKitchenOrders() {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  
  const newOrders = orders.filter(o => o.status === 'new');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');
  const completed = orders.filter(o => o.status === 'completed');
  
  renderOrderGrid('newOrdersGrid', newOrders, 'new');
  renderOrderGrid('preparingOrdersGrid', preparing, 'preparing');
  renderOrderGrid('readyOrdersGrid', ready, 'ready');
  renderOrderGrid('completedOrdersGrid', completed, 'completed');
  
  // Analytics
  const totalPrepared = completed.length;
  const pending = newOrders.length + preparing.length + ready.length;
  document.getElementById('kpiTotalPrepared').textContent = totalPrepared;
  document.getElementById('kpiPending').textContent = pending;
  document.getElementById('kpiCompleted').textContent = completed.length;
  
  // Avg time (demo)
  let avgTime = 0;
  if (completed.length > 0) {
    let totalMs = 0;
    completed.forEach(o => {
      totalMs += new Date(o.updatedAt) - new Date(o.createdAt);
    });
    avgTime = Math.round(totalMs / completed.length / 60000);
  }
  document.getElementById('kpiAvgTime').textContent = avgTime + ' min';
}

function renderOrderGrid(containerId, orders, status) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state">No orders in this section.</div>';
    return;
  }
  container.innerHTML = orders.map(o => {
    const timeElapsed = Math.floor((Date.now() - new Date(o.createdAt)) / 60000);
    const priority = timeElapsed > 15 ? 'high' : timeElapsed > 8 ? 'medium' : 'normal';
    return `
      <div class="order-card ${status}">
        <div class="order-card-header">
          <span class="order-number">${o.id}</span>
          ${priority === 'high' ? '<span class="priority-high">HIGH PRIORITY</span>' : ''}
          <span class="order-time">${new Date(o.createdAt).toLocaleTimeString()} • ${timeElapsed}m ago</span>
        </div>
        <div class="order-items">
          ${o.items.map(i => `<div>${i.qty}× ${i.name}</div>`).join('')}
        </div>
        ${o.specialInstructions ? `<p style="font-size:0.8rem;color:var(--muted);">📝 ${o.specialInstructions}</p>` : ''}
        <div class="order-actions">
          ${status === 'new' ? `<button class="btn btn-gold accept-order" data-id="${o.id}">Accept</button>` : ''}
          ${status === 'preparing' ? `<button class="btn btn-gold mark-ready" data-id="${o.id}">Mark Ready</button>` : ''}
          ${status === 'ready' ? `<button class="btn btn-gold mark-completed" data-id="${o.id}">Mark Completed</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Attach event listeners
  container.querySelectorAll('.accept-order').forEach(btn => {
    btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'preparing'));
  });
  container.querySelectorAll('.mark-ready').forEach(btn => {
    btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'ready'));
  });
  container.querySelectorAll('.mark-completed').forEach(btn => {
    btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'completed'));
  });
}

function updateOrderStatus(orderId, newStatus) {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = newStatus;
  order.updatedAt = new Date().toISOString();
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
  showToast('Order ' + orderId + ' marked as ' + newStatus, 'success');
  renderKitchenOrders();
  // Also refresh other dashboards if open
  if (document.getElementById('admin-dashboard').classList.contains('active')) {
    if (typeof initAdminDashboard === 'function') initAdminDashboard();
  }
  if (document.getElementById('customer-dashboard').classList.contains('active')) {
    if (customerState.currentUser) {
      renderCustomerOrders();
      renderCustomerHome();
    }
  }
}

/* ---------- ADMIN DASHBOARD ---------- */
function initAdminDashboard() {
  document.getElementById('adminDateTime').textContent = getCurrentDateTimeString();
  
  // Tabs
  document.querySelectorAll('[data-admin-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-admin-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      const target = document.getElementById('admin-tab-' + tab.dataset.adminTab);
      if (target) target.classList.add('active');
      refreshAdminTab(tab.dataset.adminTab);
    });
  });
  
  // Logout
  document.getElementById('adminLogout').addEventListener('click', () => {
    clearSession();
    showPage('landing-page');
    showToast('Logged out.', 'info');
  });
  
  // Refresh all tabs
  refreshAdminTab('overview');
  
  // Add dish
  document.getElementById('addDishBtn').addEventListener('click', () => {
    const name = prompt('Dish name:');
    const price = parseFloat(prompt('Price:'));
    const category = prompt('Category (starters/mains/desserts/drinks):');
    const description = prompt('Description:');
    if (!name || !price || !category) { showToast('Invalid input.', 'error'); return; }
    const dishes = loadFromStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES);
    dishes.push({
      id: generateId('d'),
      name, price, category, description: description || '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      available: true,
    });
    saveToStorage(STORAGE_KEYS.DISHES, dishes);
    showToast('Dish added.', 'success');
    refreshAdminTab('menu');
  });
  
  // Add staff
  document.getElementById('addStaffBtn').addEventListener('click', () => {
    const name = prompt('Staff name:');
    const email = prompt('Email:');
    const password = prompt('Password:');
    if (!name || !email || !password) { showToast('All fields required.', 'error'); return; }
    const users = getUsers();
    if (users.find(u => u.email === email)) { showToast('Email already exists.', 'error'); return; }
    users.push({ id: generateId('k'), name, email, password, role: 'kitchen' });
    saveUsers(users);
    showToast('Staff added.', 'success');
    refreshAdminTab('staff');
  });
  
  // Save settings
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const settings = {
      name: document.getElementById('settingName').value,
      contact: document.getElementById('settingContact').value,
      hours: document.getElementById('settingHours').value,
      delivery: parseFloat(document.getElementById('settingDelivery').value) || 5,
      tax: parseFloat(document.getElementById('settingTax').value) || 10,
      address: document.getElementById('settingAddress').value,
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    showToast('Settings saved.', 'success');
  });
  
  // Download report
  document.getElementById('downloadReportBtn').addEventListener('click', () => {
    const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
    let csv = 'Order ID,Customer,Total,Status,Date\n';
    orders.forEach(o => {
      csv += `${o.id},${o.customerName},${o.total},${o.status},${o.createdAt}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eclat_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded.', 'success');
  });
  
  // Order search & filter
  document.getElementById('adminOrderSearch').addEventListener('input', () => refreshAdminTab('orders'));
  document.getElementById('adminOrderStatusFilter').addEventListener('change', () => refreshAdminTab('orders'));
}

function refreshAdminTab(tab) {
  const orders = loadFromStorage(STORAGE_KEYS.ORDERS, []);
  const users = getUsers();
  const dishes = loadFromStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES);
  
  if (tab === 'overview') {
    const totalSales = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
    const pending = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const today = new Date().toDateString();
    const todayRevenue = orders.filter(o => o.status === 'completed' && new Date(o.updatedAt).toDateString() === today).reduce((s, o) => s + o.total, 0);
    
    document.getElementById('adminTotalSales').textContent = formatCurrency(totalSales);
    document.getElementById('adminTotalOrders').textContent = orders.length;
    document.getElementById('adminTotalCustomers').textContent = users.filter(u => u.role === 'customer').length;
    document.getElementById('adminPendingOrders').textContent = pending;
    document.getElementById('adminCompletedOrders').textContent = completed;
    document.getElementById('adminTodayRevenue').textContent = formatCurrency(todayRevenue);
    
    // Chart
    setTimeout(() => {
      const ctx = document.getElementById('salesChart');
      if (!ctx) return;
      if (window.salesChartInstance) window.salesChartInstance.destroy();
      window.salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Sales ($)',
            data: [120, 190, 300, 250, 420, 580, 400],
            backgroundColor: 'rgba(212, 175, 101, 0.6)',
            borderColor: '#D4AF65',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#F5F0E8' } } },
          scales: { x: { ticks: { color: '#A5A5A5' } }, y: { ticks: { color: '#A5A5A5' } } }
        }
      });
    }, 100);
  }
  
  if (tab === 'menu') {
    document.getElementById('adminMenuList').innerHTML = dishes.map(d => `
      <div class="menu-item-row">
        <span>${d.name}</span>
        <span>${formatCurrency(d.price)}</span>
        <span>${d.category}</span>
        <span>${d.available ? '✅' : '❌'}</span>
        <button class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.6rem;" onclick="toggleDishAvailability('${d.id}')">Toggle</button>
      </div>
    `).join('');
  }
  
  if (tab === 'orders') {
    const search = (document.getElementById('adminOrderSearch').value || '').toLowerCase();
    const filter = document.getElementById('adminOrderStatusFilter').value;
    let filtered = orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(search) || o.customerName.toLowerCase().includes(search);
      const matchStatus = filter === 'all' || o.status === filter;
      return matchSearch && matchStatus;
    });
    document.getElementById('adminOrdersList').innerHTML = filtered.map(o => `
      <div class="order-history-item">
        <span>${o.id}</span>
        <span>${o.customerName}</span>
        <span>${formatCurrency(o.total)}</span>
        <span class="badge" style="background:${o.status==='completed'?'#2ecc71':o.status==='cancelled'?'#e74c3c':'#f5b041'}">${o.status}</span>
        <span style="font-size:0.8rem;color:var(--muted);">${new Date(o.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('') || '<div class="empty-state">No orders found.</div>';
  }
  
  if (tab === 'staff') {
    const staff = users.filter(u => u.role === 'kitchen');
    document.getElementById('adminStaffList').innerHTML = staff.map(s => `
      <div class="staff-row">
        <span>${s.name}</span>
        <span>${s.email}</span>
        <span>Active</span>
      </div>
    `).join('') || '<div class="empty-state">No staff.</div>';
  }
  
  if (tab === 'customers') {
    const customers = users.filter(u => u.role === 'customer');
    document.getElementById('adminCustomerList').innerHTML = customers.map(c => `
      <div class="customer-row">
        <span>${c.name}</span>
        <span>${c.email}</span>
      </div>
    `).join('') || '<div class="empty-state">No customers.</div>';
  }
  
  if (tab === 'finance') {
    const totalSales = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
    const today = new Date().toDateString();
    const daily = orders.filter(o => o.status === 'completed' && new Date(o.updatedAt).toDateString() === today).reduce((s, o) => s + o.total, 0);
    document.getElementById('financeDaily').textContent = formatCurrency(daily);
    document.getElementById('financeWeekly').textContent = formatCurrency(daily * 5);
    document.getElementById('financeMonthly').textContent = formatCurrency(daily * 22);
    document.getElementById('financeTotal').textContent = formatCurrency(totalSales);
  }
  
  if (tab === 'reservations') {
    const reservations = loadFromStorage(STORAGE_KEYS.RESERVATIONS, []);
    document.getElementById('adminReservationsList').innerHTML = reservations.map(r => `
      <div class="order-history-item">
        <span>${r.name}</span>
        <span>${r.date} ${r.time}</span>
        <span>${r.guests} guests</span>
        <span class="badge" style="background:#f5b041">${r.status}</span>
      </div>
    `).join('') || '<div class="empty-state">No reservations.</div>';
  }
}

function toggleDishAvailability(dishId) {
  const dishes = loadFromStorage(STORAGE_KEYS.DISHES, DEFAULT_DISHES);
  const dish = dishes.find(d => d.id === dishId);
  if (dish) {
    dish.available = !dish.available;
    saveToStorage(STORAGE_KEYS.DISHES, dishes);
    refreshAdminTab('menu');
    showToast('Dish availability updated.', 'success');
  }
}

/* ---------- GLOBAL INIT & EVENT LISTENERS ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initAppData();
  
  // Initialize lucide icons
  if (window.lucide) lucide.createIcons();
  
  // Login triggers
  document.querySelectorAll('.login-trigger').forEach(btn => {
    btn.addEventListener('click', () => openLogin(btn.dataset.role));
  });
  
  // Close login
  document.getElementById('closeLogin').addEventListener('click', () => {
    showPage('landing-page');
  });
  
  // Login form submit
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Register form submit
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  
  // Show register form
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
  });
  
  // Show login form
  document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  });
  
  // Book a table trigger (demo)
  document.querySelectorAll('.book-table-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Please log in as a customer to book a table.', 'info');
      openLogin('customer');
    });
  });
  
  // Render landing menu
  renderLandingMenu();
  
  // Mobile nav toggle (simple scroll to sections)
  document.getElementById('mobileNavToggle')?.addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('show');
  });
  
  // Re-render landing menu on changes
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.DISHES) renderLandingMenu();
  });
  
  // Initial lucide icons
  if (window.lucide) lucide.createIcons();
});