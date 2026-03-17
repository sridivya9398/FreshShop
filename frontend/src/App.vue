<template>
  <div class="app-container">

    <!-- ════════════════════════════════════════════════════
         NAVBAR — always 100% wide, inner content max-1200
    ═════════════════════════════════════════════════════ -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="logo" @click="goToShop">FreshShop</div>

        <!-- Search: hidden on login/signup pages -->
        <div class="search-bar" v-if="currentPage === 'shop' || currentPage === 'cart'">
          <input
            id="search-input"
            type="text"
            v-model="searchQuery"
            placeholder="Search products…"
            @keydown.enter="applySearch"
          />
          <button class="search-btn" @click="applySearch">Search</button>
        </div>
        <div class="nav-spacer" v-else></div>

        <div class="nav-right">
          <template v-if="loggedIn">
            <span class="nav-user">Hello, {{ userName }}</span>
            <button class="nav-link-btn" @click="handleLogout">Sign Out</button>
          </template>
          <template v-else>
            <button class="nav-link-btn" @click="goToLogin">Sign In</button>
          </template>

          <div
            class="cart-status"
            @click="goToCart"
            v-if="currentPage !== 'login' && currentPage !== 'signup'"
          >
            <span>🛒</span>
            <span class="badge">{{ cartCount }}</span>
            <span class="cart-total" v-if="cartTotal > 0"> ${{ cartTotal.toFixed(2) }}</span>
            <span class="cart-label">Cart</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Sub-nav — only on shop/cart -->
    <div class="sub-nav" v-if="currentPage === 'shop' || currentPage === 'cart'">
      <div class="sub-inner">
        <span @click="goToShop; activeCategoryId = null">☰ All</span>
        <span v-for="link in navLinks" :key="link" @click="handleNavLinkClick(link)">{{ link }}</span>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════
         PAGE TRANSITIONS
    ═════════════════════════════════════════════════════ -->
    <Transition name="page" mode="out-in">

      <!-- ── LOGIN PAGE ────────────────────────────────── -->
      <div v-if="currentPage === 'login'" key="login" class="auth-page">
        <div class="auth-card">
          <h2>Sign In</h2>
          <p class="auth-sub">New to FreshShop? <span class="auth-link" @click="goToSignup">Create an account</span></p>
          <div class="form-group">
            <label>Email</label>
            <input id="login-email" type="email" v-model="loginForm.email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input id="login-password" type="password" v-model="loginForm.password" placeholder="Your password" />
          </div>
          <div class="auth-error" v-if="authError">{{ authError }}</div>
          <button class="auth-btn" @click="handleLogin">Sign In</button>
          <button class="auth-btn-outline" @click="goToShop">Continue as Guest</button>
        </div>
      </div>

      <!-- ── SIGN UP PAGE ───────────────────────────────── -->
      <div v-else-if="currentPage === 'signup'" key="signup" class="auth-page">
        <div class="auth-card">
          <h2>Create Account</h2>
          <p class="auth-sub">Already have an account? <span class="auth-link" @click="goToLogin">Sign in</span></p>
          <div class="form-group">
            <label>Full Name</label>
            <input id="signup-name" type="text" v-model="signupForm.name" placeholder="Your full name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input id="signup-email" type="email" v-model="signupForm.email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input id="signup-password" type="password" v-model="signupForm.password" placeholder="Create a password" />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input id="signup-confirm" type="password" v-model="signupForm.confirm" placeholder="Repeat password" />
          </div>
          <div class="auth-error" v-if="authError">{{ authError }}</div>
          <button class="auth-btn" @click="handleSignup">Create Account</button>
          <button class="auth-btn-outline" @click="goToShop">Continue as Guest</button>
        </div>
      </div>

      <!-- ── SHOP PAGE ─────────────────────────────────── -->
      <main v-else-if="currentPage === 'shop'" key="shop" class="page-body">
        <div class="main-layout">
          <!-- Left sidebar -->
          <aside class="sidebar-categories">
            <h3>Departments</h3>
            <ul>
              <li
                :class="{ active: activeCategoryId === null }"
                @click="selectCategory(null)"
              >All Departments</li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                :class="{ active: activeCategoryId === cat.id }"
                @click="selectCategory(cat.id)"
              >{{ cat.name }}</li>
            </ul>
          </aside>

          <!-- Catalog -->
          <section class="catalog">
            <div v-if="loading" class="loading-state">Loading products…</div>

            <!-- No results banner -->
            <div v-else-if="filteredCategories.length === 0" class="no-results">
              No products found for "<strong>{{ searchQuery }}</strong>".
              <span class="auth-link" @click="clearSearch"> Clear search</span>
            </div>

            <Transition name="fade" mode="out-in">
              <div :key="(activeCategoryId ?? 'all') + searchQuery" class="catalog-inner">
                <div v-for="cat in filteredCategories" :key="cat.id" class="category-group">
                  <h2 class="category-header">{{ cat.name }}</h2>
                  <div class="grid">
                    <div v-for="item in cat.items" :key="item.id" class="card">
                      <div class="card-image" :class="getColorClass(cat.name)">
                        <span>{{ cat.name.substring(0, 2).toUpperCase() }}</span>
                      </div>
                      <div class="card-body">
                        <h4 class="item-name">{{ item.name }}</h4>
                        <div class="item-price">
                          <span class="currency">$</span>{{ Math.floor(item.price || 0) }}<span class="cents">{{ getCents(item.price) }}</span>
                        </div>
                        <div class="delivery-date">FREE delivery <b>Tomorrow</b></div>
                        <button class="add-to-cart-btn" @click="addToCart(item)">Add to Cart</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </section>
        </div>
      </main>

      <!-- ── CART PAGE ─────────────────────────────────── -->
      <main v-else-if="currentPage === 'cart'" key="cart" class="page-body">
        <div class="cart-page">
          <div class="cart-page-header">
            <h1>Shopping Cart</h1>
            <button class="back-btn" @click="goToShop">← Continue Shopping</button>
          </div>

          <div v-if="cart.length === 0" class="empty-cart-page">
            <p>Your cart is empty.</p>
            <button class="auth-btn" style="max-width:220px;margin:0 auto;" @click="goToShop">Browse Products</button>
          </div>

          <div v-else class="cart-layout">
            <!-- Items list -->
            <div class="cart-items-panel">
              <div class="cart-item-row" v-for="item in cart" :key="item.id">
                <div class="cart-item-thumb" :class="getColorClass(getCategoryName(item))">
                  {{ item.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-stock">In Stock</div>
                  <button class="remove-btn" @click="removeItem(item)">Remove</button>
                </div>
                <div class="qty-picker">
                  <button @click="decreaseQty(item)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="increaseQty(item)">+</button>
                </div>
                <div class="cart-item-price">${{ ((item.price || 0) * item.quantity).toFixed(2) }}</div>
              </div>
            </div>

            <!-- Order summary -->
            <aside class="order-summary">
              <h2>Order Summary</h2>
              <div class="summary-line">
                <span>Items ({{ cartCount }}):</span><span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="summary-line">
                <span>Shipping:</span><span class="free">FREE</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-line total">
                <strong>Order Total:</strong><strong>${{ cartTotal.toFixed(2) }}</strong>
              </div>
              <button class="auth-btn checkout-cta" @click="saveCart" :disabled="saving">
                {{ saving ? 'Processing…' : 'Proceed to Checkout' }}
              </button>
              <button class="auth-btn-outline" @click="clearCart">Clear Cart</button>
            </aside>
          </div>
        </div>
      </main>

    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// ── State ─────────────────────────────────────────────────────────
const categories       = ref([]);
const cart             = ref([]);
const loading          = ref(true);
const saving           = ref(false);
const activeCategoryId = ref(null);
const currentPage      = ref('shop');   // 'shop' | 'cart' | 'login' | 'signup'
const searchQuery      = ref('');

// Auth — backed by real JWT from the Node.js API
const loggedIn  = ref(false);
const userName  = ref('');
const authToken = ref(localStorage.getItem('token') || '');
const authError = ref('');
const loginForm  = ref({ email: '', password: '' });
const signupForm = ref({ name: '', email: '', password: '', confirm: '' });

const navLinks = ["Today's Deals", "Customer Service", "Registry", "Gift Cards", "Sell"];
const API_URL  = 'http://localhost:3000/api';

// Helper: build Axios config with JWT Authorization header
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${authToken.value}` }
});

// ── Computed ──────────────────────────────────────────────────────
const cartCount = computed(() =>
  cart.value.reduce((s, i) => s + i.quantity, 0)
);

const cartTotal = computed(() =>
  cart.value.reduce((s, i) => {
    const p = typeof i.price === 'number' ? i.price : parseFloat(i.price) || 0;
    return s + p * i.quantity;
  }, 0)
);

// Filter by both category and search query
const filteredCategories = computed(() => {
  let cats = activeCategoryId.value === null
    ? categories.value
    : categories.value.filter(c => c.id === activeCategoryId.value);

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    cats = cats
      .map(cat => ({ ...cat, items: cat.items.filter(i => i.name.toLowerCase().includes(q)) }))
      .filter(cat => cat.items.length > 0);
  }
  return cats;
});

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  // Restore session from localStorage if a token exists
  const storedToken = localStorage.getItem('token');
  const storedUser  = localStorage.getItem('user');
  if (storedToken && storedUser) {
    authToken.value = storedToken;
    const user = JSON.parse(storedUser);
    loggedIn.value = true;
    userName.value = user.name;
  }
  await fetchProducts();
  if (loggedIn.value) await fetchCart();
});

// ── Helpers ───────────────────────────────────────────────────────
const getCents = (price) => {
  const p = price || 0;
  const c = Math.round((p - Math.floor(p)) * 100);
  return c === 0 ? '00' : c.toString().padStart(2, '0');
};

const getColorClass = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('produce')) return 'bg-produce';
  if (n.includes('beer'))    return 'bg-beer';
  if (n.includes('bakery'))  return 'bg-bakery';
  if (n.includes('dairy'))   return 'bg-dairy';
  if (n.includes('snacks'))  return 'bg-snacks';
  if (n.includes('frozen'))  return 'bg-frozen';
  return 'bg-default';
};

const getCategoryName = (item) => {
  for (const cat of categories.value) {
    if (cat.items.some(i => i.id === item.id)) return cat.name;
  }
  return '';
};

// ── Navigation ────────────────────────────────────────────────────
const goToShop   = () => { currentPage.value = 'shop'; };
const goToCart   = () => { currentPage.value = 'cart'; };
const goToLogin  = () => { authError.value = ''; currentPage.value = 'login'; };
const goToSignup = () => { authError.value = ''; currentPage.value = 'signup'; };

const selectCategory = (id) => { activeCategoryId.value = id; };

const applySearch = () => {
  // filteredCategories computed is already reactive — nothing more needed
  // If on cart, go back to shop to show results
  if (currentPage.value !== 'shop') currentPage.value = 'shop';
};

const clearSearch = () => { searchQuery.value = ''; };

const handleNavLinkClick = (link) => { alert(`${link} — coming soon!`); };

// ── Auth — real API calls ─────────────────────────────────────────
const handleLogin = async () => {
  authError.value = '';
  if (!loginForm.value.email || !loginForm.value.password) {
    authError.value = 'Please fill in all fields.'; return;
  }
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, {
      email:    loginForm.value.email,
      password: loginForm.value.password,
    });
    // Store token and user in localStorage for session persistence
    authToken.value = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    loggedIn.value = true;
    userName.value = data.user.name;
    loginForm.value = { email: '', password: '' };
    await fetchCart(); // load this user's cart from Redis
    currentPage.value = 'shop';
  } catch (err) {
    authError.value = err.response?.data?.error || 'Login failed. Please try again.';
  }
};

const handleSignup = async () => {
  authError.value = '';
  const { name, email, password, confirm } = signupForm.value;
  if (!name || !email || !password || !confirm) {
    authError.value = 'Please fill in all fields.'; return;
  }
  if (password !== confirm) {
    authError.value = 'Passwords do not match.'; return;
  }
  try {
    const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    authToken.value = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    loggedIn.value = true;
    userName.value = data.user.name;
    signupForm.value = { name: '', email: '', password: '', confirm: '' };
    currentPage.value = 'shop';
  } catch (err) {
    authError.value = err.response?.data?.error || 'Registration failed. Please try again.';
  }
};

const handleLogout = () => {
  authToken.value = '';
  loggedIn.value  = false;
  userName.value  = '';
  cart.value      = [];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentPage.value = 'shop';
};

// ── API ───────────────────────────────────────────────────────────
const fetchProducts = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/items`);
    const seededPrices = {
      'Organic Carrot Bundle': 1.99, 'Fuji Apple': 0.89, 'Navel Orange': 1.25,
      'Fresh Spinach': 2.49,  'Bananas (Bunch)': 1.79,
      'Michelob ULTRA 6-Pack': 8.99, 'Coors Light 12-Pack': 14.99, 'Spotted Cow 6-Pack': 10.49,
      'Glazed Donut': 1.50,   'Sourdough Bread': 4.50,
      'Cinnamon Roll': 2.50,  'Chocolate Croissant': 3.00, 'French Baguette': 3.50,
    };
    categories.value = data.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({
        ...item,
        price: item.price ? parseFloat(item.price) : (seededPrices[item.name] || 1.99),
      })),
    }));
  } catch (e) {
    console.error('Fetch products failed:', e);
  } finally {
    loading.value = false;
  }
};

const fetchCart = async () => {
  if (!loggedIn.value) return; // only fetch if logged in
  try {
    const { data } = await axios.get(`${API_URL}/cart`, authHeaders());
    if (Array.isArray(data)) cart.value = data;
  } catch (e) { console.error('Fetch cart failed:', e); }
};

const addToCart = (product) => {
  const ex = cart.value.find(i => i.id === product.id);
  if (ex) ex.quantity++;
  else cart.value.push({ ...product, quantity: 1 });
};

const increaseQty = (item) => { item.quantity++; };
const decreaseQty = (item) => { item.quantity > 1 ? item.quantity-- : removeItem(item); };
const removeItem  = (item) => { cart.value = cart.value.filter(c => c.id !== item.id); };
const clearCart   = () => { cart.value = []; };

const saveCart = async () => {
  if (!loggedIn.value) {
    alert('Please sign in to save your cart.');
    goToLogin();
    return;
  }
  saving.value = true;
  try {
    await axios.post(`${API_URL}/cart`, cart.value, authHeaders());
    alert('Cart saved! Your order is confirmed.');
  } catch (e) {
    alert('Error saving cart. Please sign in and try again.');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
/* ════════════════════════════════════════════════════
   BASE
═════════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; }

.app-container {
  min-height: 100vh;
  background: #f0f4f8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  flex-direction: column;
}

/* ════════════════════════════════════════════════════
   NAVBAR — full screen width, fixed inner max-width
═════════════════════════════════════════════════════ */
.navbar {
  background: #1e293b;
  color: white;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 200;
}

/* This inner div controls the max-width for ALL pages */
.nav-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: -0.5px;
  color: #fff;
}

.search-bar {
  flex: 1;
  display: flex;
  height: 38px;
}
.search-bar input {
  flex: 1;
  padding: 0 14px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 0.9rem;
  outline: none;
}
.search-btn {
  background: #0d9488;
  border: none;
  padding: 0 18px;
  border-radius: 0 4px 4px 0;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
}
.search-btn:hover { background: #0f766e; }

.nav-spacer { flex: 1; }

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.nav-user {
  font-size: 0.85rem;
  color: #94a3b8;
}

.nav-link-btn {
  background: none;
  border: 1px solid #475569;
  border-radius: 4px;
  color: white;
  font-size: 0.85rem;
  padding: 5px 12px;
  cursor: pointer;
}
.nav-link-btn:hover { background: rgba(255,255,255,0.08); }

.cart-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: border-color 0.15s, background 0.15s;
}
.cart-status:hover { border-color: white; background: rgba(255,255,255,0.07); }
.badge {
  background: #0d9488;
  color: white;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 0.78rem;
  font-weight: 800;
}
.cart-total { color: #5eead4; font-size: 0.9rem; }
.cart-label { color: #cbd5e1; font-size: 0.8rem; }

/* ════════════════════════════════════════════════════
   SUB-NAV
═════════════════════════════════════════════════════ */
.sub-nav { background: #334155; color: white; font-size: 0.85rem; }
.sub-inner {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 5px 24px;
  display: flex;
  gap: 20px;
}
.sub-inner span {
  cursor: pointer;
  padding: 4px 2px;
  border: 1px solid transparent;
  border-radius: 2px;
}
.sub-inner span:hover { border-color: #94a3b8; }

/* ════════════════════════════════════════════════════
   PAGE TRANSITIONS
═════════════════════════════════════════════════════ */
.page-enter-active, .page-leave-active { transition: opacity 0.18s ease; }
.page-enter-from,  .page-leave-to      { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

/* ════════════════════════════════════════════════════
   PAGE BODY WRAPPER — ensures consistent max-width
═════════════════════════════════════════════════════ */
.page-body {
  width: 100%;
  flex: 1;
}

/* ════════════════════════════════════════════════════
   SHOP — main layout
═════════════════════════════════════════════════════ */
.main-layout {
  max-width: 1200px;
  width: 100%;
  margin: 24px auto;
  padding: 0 24px 60px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  min-height: calc(100vh - 130px);
}

/* ── Sidebar ───────────────────────────────────────── */
.sidebar-categories {
  width: 190px;
  flex-shrink: 0;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  position: sticky;
  top: 68px;
}
.sidebar-categories h3 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.sidebar-categories ul { list-style: none; padding: 0; margin: 0; }
.sidebar-categories li {
  padding: 7px 0;
  font-size: 0.88rem;
  cursor: pointer;
  color: #374151;
  text-transform: capitalize;
  border-radius: 3px;
  transition: color 0.15s;
}
.sidebar-categories li:hover  { color: #0d9488; text-decoration: underline; }
.sidebar-categories li.active { color: #0d9488; font-weight: 700; }

/* ── Catalog ───────────────────────────────────────── */
.catalog { flex: 1; min-height: calc(100vh - 180px); }

.catalog-inner { min-height: calc(100vh - 200px); }

.no-results {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
}

.category-header {
  font-size: 1.15rem;
  background: white;
  padding: 10px 18px;
  margin: 0 0 14px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  text-transform: capitalize;
  border-left: 4px solid #0d9488;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.09);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.13); transform: translateY(-2px); }

.card-image {
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.2rem;
  font-weight: 900;
}

.bg-produce { background: linear-gradient(135deg, #059669, #34d399); }
.bg-beer    { background: linear-gradient(135deg, #b45309, #fbbf24); }
.bg-bakery  { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.bg-dairy   { background: linear-gradient(135deg, #1d4ed8, #60a5fa); }
.bg-snacks  { background: linear-gradient(135deg, #c2410c, #fb923c); }
.bg-frozen  { background: linear-gradient(135deg, #0891b2, #67e8f9); }
.bg-default { background: linear-gradient(135deg, #0e7490, #22d3ee); }

.card-body { padding: 14px; display: flex; flex-direction: column; flex: 1; }

.item-name {
  margin: 0 0 6px;
  font-size: 0.93rem;
  color: #1e40af;
  font-weight: 600;
  flex: 1;
}
.item-name:hover { color: #0d9488; text-decoration: underline; cursor: pointer; }

.item-price { font-size: 1.4rem; color: #111827; margin-bottom: 4px; line-height: 1; }
.currency, .cents { font-size: 0.72rem; vertical-align: top; position: relative; top: 0.2em; }

.delivery-date { font-size: 0.76rem; color: #6b7280; margin-bottom: 12px; }

.add-to-cart-btn {
  background: #0d9488; border: none; border-radius: 20px;
  padding: 8px; cursor: pointer; font-size: 0.88rem;
  color: white; font-weight: 700; width: 100%;
  transition: background 0.2s;
}
.add-to-cart-btn:hover { background: #0f766e; }

/* ════════════════════════════════════════════════════
   CART PAGE
═════════════════════════════════════════════════════ */
.cart-page {
  max-width: 1200px;
  width: 100%;
  margin: 30px auto;
  padding: 0 24px 60px;
  min-height: calc(100vh - 130px);
}

.cart-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.cart-page-header h1 {
  font-size: 1.7rem;
  color: #1e293b;
  margin: 0;
  border-bottom: 2px solid #0d9488;
  padding-bottom: 4px;
}

.back-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 7px 16px;
  cursor: pointer;
  color: #1e40af;
  font-weight: 600;
  font-size: 0.88rem;
}
.back-btn:hover { background: #f0f4f8; }

.empty-cart-page { text-align: center; padding: 60px 0; color: #6b7280; font-size: 1.05rem; }

.cart-layout { display: flex; gap: 24px; align-items: flex-start; }

.cart-items-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
}

.cart-item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.cart-item-row:last-child { border-bottom: none; }
.cart-item-row:hover { background: #f8fafc; }

.cart-item-thumb {
  width: 72px; height: 72px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;
}

.cart-item-info { flex: 1; }
.cart-item-name { font-size: 0.95rem; font-weight: 600; color: #1e40af; margin-bottom: 3px; }
.cart-item-stock { font-size: 0.78rem; color: #059669; margin-bottom: 6px; }

.remove-btn {
  background: none; border: none; color: #0d9488;
  cursor: pointer; font-size: 0.8rem; padding: 0; text-decoration: underline;
}

.qty-picker {
  display: flex; align-items: center;
  border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; flex-shrink: 0;
}
.qty-picker button {
  background: #f9fafb; border: none; padding: 6px 13px;
  cursor: pointer; font-size: 1rem; transition: background 0.15s;
}
.qty-picker button:hover { background: #e5e7eb; }
.qty-picker span {
  padding: 0 10px; font-size: 0.9rem; font-weight: 700;
  min-width: 24px; text-align: center;
}

.cart-item-price {
  font-size: 1.05rem; font-weight: 700; color: #111827;
  min-width: 65px; text-align: right; flex-shrink: 0;
}

.order-summary {
  width: 280px; flex-shrink: 0;
  background: white; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  padding: 20px; position: sticky; top: 76px;
}
.order-summary h2 { margin: 0 0 16px; font-size: 1.1rem; color: #1e293b; }

.summary-line {
  display: flex; justify-content: space-between;
  font-size: 0.92rem; color: #374151; margin-bottom: 10px;
}
.summary-line.total { font-size: 1rem; color: #111827; margin-top: 4px; }
.free { color: #059669; font-weight: 600; }
.summary-divider { height: 1px; background: #e5e7eb; margin: 10px 0; }

.checkout-cta { margin-top: 16px !important; }

/* ════════════════════════════════════════════════════
   AUTH PAGES (Login / Signup)
═════════════════════════════════════════════════════ */
.auth-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  min-height: calc(100vh - 100px);
  background: #f0f4f8;
}

.auth-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 40px 44px;
  width: 100%;
  max-width: 420px;
}

.auth-card h2 {
  margin: 0 0 6px;
  font-size: 1.7rem;
  color: #1e293b;
}

.auth-sub {
  font-size: 0.88rem;
  color: #6b7280;
  margin: 0 0 28px;
}

.auth-link {
  color: #0d9488;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.form-group input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,0.15);
}

.auth-error {
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 12px;
}

/* Shared button styles */
.auth-btn {
  display: block;
  width: 100%;
  background: #1e40af;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 10px;
}
.auth-btn:hover    { background: #1e3a8a; }
.auth-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

.auth-btn-outline {
  display: block;
  width: 100%;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 6px;
}
.auth-btn-outline:hover { background: #f9fafb; }

.loading-state {
  padding: 40px; text-align: center; color: #6b7280; font-size: 1rem;
}
</style>
