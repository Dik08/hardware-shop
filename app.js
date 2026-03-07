// 1. FIREBASE INITIALIZATION
const firebaseConfig = {
  apiKey: "AIzaSyAfO4vESUV5EweTKwZ8z37xhQAvAptihVI",
  authDomain: "ashirbad-hardware-388ff.firebaseapp.com",
  databaseURL: "https://ashirbad-hardware-388ff-default-rtdb.firebaseio.com",
  projectId: "ashirbad-hardware-388ff",
  storageBucket: "ashirbad-hardware-388ff.firebasestorage.app",
  messagingSenderId: "28548957243",
  appId: "1:28548957243:web:8f8a620d095ce7fb29c81e"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const ADMIN_CRED = { user: "admin", pass: "dik2026" };
let products = [];
let cart = [];
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error("Error loading products", e); }
}

// 2. PRODUCT RENDERING & DETAILS
function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <img src="images/${item.img}" alt="${item.name}" onclick="viewProductDetails(${item.id})">
            <span style="color:#2ecc71; font-size:0.75rem; font-weight:bold;"><i class="fas fa-check-circle"></i> In stock</span>
            <h4 style="margin: 8px 0; font-size: 0.85rem;">${item.name}</h4>
            <p style="color:var(--brand-blue); font-weight:800; margin:0;">₹${item.price}</p>
            <button class="pro-add-btn" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

function viewProductDetails(id) {
    const item = products.find(p => p.id === id);
    const modal = document.getElementById('productModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span onclick="closeModal()" style="position:absolute; right:20px; cursor:pointer; font-size:1.5rem;">&times;</span>
            <img src="images/${item.img}" style="width:100%; max-height:250px; object-fit:contain; border-radius:8px;">
            <h2 style="color:var(--brand-blue);">${item.name}</h2>
            <p style="font-weight:bold; font-size:1.4rem;">₹${item.price}</p>
            <p style="color:#666;">${item.description || "Quality hardware from Ashirbad shop in Chandpara."}</p>
            <button class="pro-add-btn" onclick="addToCart(${item.id}); closeModal();">ADD TO ORDER</button>
        </div>`;
    modal.style.display = 'flex';
}

// 3. CLOUD SYNC & DASHBOARD
function sendToWhatsApp() {
    if (!cart.length) return alert("Empty!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const order = { date: new Date().toLocaleString(), items: cart.map(i => i.name).join(', '), total };
    
    // Push to Cloud Database (Reflects on all owner devices)
    database.ref('orders').push(order);

    window.open(`https://wa.me/919547675034?text=Order of ₹${total}`);
}

function handleLogin() {
    if (document.getElementById('adminUser').value === ADMIN_CRED.user && 
        document.getElementById('adminPass').value === ADMIN_CRED.pass) {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    } else alert("Access Denied");
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const sales = snap.val() ? Object.values(snap.val()) : [];
        document.getElementById('totalSalesCount').innerText = sales.length;
        document.getElementById('totalRevenue').innerText = `₹${sales.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
        document.getElementById('salesBody').innerHTML = sales.map(s => `<tr><td>${s.date}</td><td>${s.items}</td><td>₹${s.total}</td></tr>`).reverse().join('');
    });
}

// UI Helpers
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function closeModal() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }
function setCategory(cat) { currentCategory = cat; if(document.getElementById('sidebar').classList.contains('active-l')) toggleSidebar(); filterProducts(); }

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
    const feat = products.filter(p => (p.featured === true || p.featured === "TRUE") && currentCategory === 'all' && term === "");
    document.getElementById('featured-section').style.display = feat.length > 0 ? 'block' : 'none';
    renderProducts(feat, 'featured-list');
}

function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });
    updateCartUI();
    if (!document.getElementById('cart-panel').classList.contains('active-r')) toggleCart();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map(item => `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;"><span>${item.name} x${item.quantity}</span><span>₹${item.price * item.quantity}</span></div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}

loadProducts();
