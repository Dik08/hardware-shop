// FIREBASE INITIALIZATION
const firebaseConfig = {
  apiKey: "AIzaSyAfO4vESUV5EweTKwZ8z37xhQAvAptihVI",
  authDomain: "ashirbad-hardware-388ff.firebaseapp.com",
  databaseURL: "https://ashirbad-hardware-388ff-default-rtdb.firebaseio.com",
  projectId: "ashirbad-hardware-388ff",
  appId: "1:28548957243:web:8f8a620d095ce7fb29c81e"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth(); // cite: 1.3

let products = [];
let cart = [];
let allOrders = [];
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error(e); }
}

// 1. FIREBASE AUTHENTICATION
function handleAuthLogin() {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            closeModal();
            document.getElementById('adminDashboard').style.display = 'flex';
            syncDashboard();
        })
        .catch((error) => {
            alert("Secure Access Denied: " + error.message);
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        document.getElementById('adminDashboard').style.display = 'none';
        alert("Logged out successfully.");
    });
}

// 2. SEARCH & LOCATION
function openLocation() { window.open("https://maps.google.com/?q=Chandpara+Hardware", "_blank"); } // cite: 1.1

function searchOrders() {
    const term = document.getElementById('dash-search').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.customer.toLowerCase().includes(term) || (o.id && o.id.toLowerCase().includes(term))
    );
    displayOrdersInTable(filtered);
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        displayOrdersInTable(allOrders);
    });
}

function displayOrdersInTable(list) {
    document.getElementById('totalSalesCount').innerText = list.length;
    document.getElementById('totalRevenue').innerText = `₹${list.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
    document.getElementById('salesBody').innerHTML = list.map(s => `
        <tr>
            <td><span style="color:#888;">#${s.id}</span><br>${s.date}</td>
            <td><b>${s.customer}</b><br><span style="color:var(--blue);">${s.phone}</span></td>
            <td>${s.items}</td>
            <td><b>₹${s.total}</b></td>
            <td><i class="fas fa-trash" onclick="deleteOrder('${s.dbId}')" style="color:red; cursor:pointer;"></i></td>
        </tr>`).reverse().join('');
}

// 3. CORE FUNCTIONS
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function deleteOrder(id) { if(confirm("Confirm: Delete record?")) database.ref('orders/' + id).remove(); }

function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    if (!name || !phone) return alert("Enter Info!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = "ASH" + Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, date: new Date().toLocaleString(), customer: name, phone: phone, items: cart.map(i => i.name).join(', '), total: total });
    window.open(`https://wa.me/919547675034?text=Order ID: ${orderId}%0ACustomer: ${name}%0ATotal: ₹${total}`);
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    document.getElementById('product-list').innerHTML = filtered.map(item => `
        <div class="product-card">
            <span style="color:#2ecc71; font-size:0.7rem; font-weight:bold;"><i class="fas fa-check-circle"></i> In stock</span>
            <img src="images/${item.img}" alt="${item.name}">
            <h4 style="margin: 8px 0; font-size: 0.85rem;">${item.name}</h4>
            <p style="color:var(--blue); font-weight:800;">₹${item.price}</p>
            <button class="blue-btn" style="padding:10px; font-size:0.75rem;" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

function setCategory(cat) { currentCategory = cat; if(document.getElementById('sidebar').classList.contains('active-l')) toggleSidebar(); filterProducts(); }
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++; else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}
function updateCartUI() {
    document.getElementById('cart-items-list').innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;"><span>${i.name} x${i.quantity}</span><span>₹${i.price*i.quantity}</span></div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}
loadProducts();
