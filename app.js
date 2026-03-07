// 1. FIREBASE SETUP
const firebaseConfig = {
  apiKey: "AIzaSyAfO4vESUV5EweTKwZ8z37xhQAvAptihVI",
  databaseURL: "https://ashirbad-hardware-388ff-default-rtdb.firebaseio.com",
  projectId: "ashirbad-hardware-388ff",
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
    } catch (e) { console.error("Inventory error", e); }
}

// 2. RENDERING WITH PRODUCT DETAILS
function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <span class="stock-label"><i class="fas fa-check-circle"></i> In stock</span>
            <img src="images/${item.img}" alt="${item.name}" onclick="viewDetails(${item.id})">
            <h4 style="margin: 8px 0; font-size: 0.85rem;">${item.name}</h4>
            <p class="card-price">₹${item.price}</p>
            <button class="wp-order-btn" style="padding:8px; font-size:0.75rem;" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

function viewDetails(id) {
    const item = products.find(p => p.id === id);
    const modal = document.getElementById('productModal');
    modal.innerHTML = `
        <div class="modal-box">
            <span onclick="closeModal()" style="float:right; cursor:pointer;">&times;</span>
            <img src="images/${item.img}" style="width:100%; max-height:220px; object-fit:contain;">
            <h2 style="color:var(--blue); margin-bottom:0;">${item.name}</h2>
            <p style="font-weight:bold; font-size:1.4rem;">₹${item.price}</p>
            <p style="color:#666; line-height:1.4;">${item.description || "Ashirbad Hardware: Quality tools for every project."}</p>
            <button class="wp-order-btn" onclick="addToCart(${item.id}); closeModal();">ADD TO ORDER</button>
        </div>`;
    modal.style.display = 'flex';
}

// 3. WHATSAPP & CLOUD SYNC
function sendToWhatsApp() {
    if (!cart.length) return alert("Your order list is empty!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    // PUSH TO CLOUD
    database.ref('orders').push({
        date: new Date().toLocaleString(),
        items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: total
    });

    // CLEAN WHATSAPP MESSAGE
    let msg = "*ORDER - ASHIRBAD HARDWARE*%0A---------------------------%0A";
    cart.forEach((i, idx) => {
        msg += `*${idx+1}.* ${i.name}%0A   Qty: ${i.quantity} | Total: ₹${i.price * i.quantity}%0A`;
    });
    msg += `---------------------------%0A*Grand Total: ₹${total}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
}

// 4. OWNER DASHBOARD
function handleLogin() {
    if (document.getElementById('adminUser').value === ADMIN_CRED.user && 
        document.getElementById('adminPass').value === ADMIN_CRED.pass) {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    } else alert("Invalid Access");
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const sales = snap.val() ? Object.values(snap.val()) : [];
        document.getElementById('totalSalesCount').innerText = sales.length;
        document.getElementById('totalRevenue').innerText = `₹${sales.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
        document.getElementById('salesBody').innerHTML = sales.map(s => `<tr><td>${s.date}</td><td>${s.items}</td><td>₹${s.total}</td></tr>`).reverse().join('');
    });
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    if (!cart.length) { list.innerHTML = "<p style='text-align:center; color:#999;'>Empty</p>"; }
    else {
        list.innerHTML = `<div class="cart-row" style="font-weight:bold;"><span>Item</span><span>Qty</span><span>Sub</span></div>` + 
        cart.map(i => `<div class="cart-row"><span>${i.name}</span><span>x${i.quantity}</span><span>₹${i.price * i.quantity}</span></div>`).join('');
    }
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}

loadProducts();
