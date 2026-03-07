// FIREBASE CONFIG
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
let allOrders = []; // To store orders for searching
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error("Data error", e); }
}

// SEARCH FUNCTION FOR OWNER
function searchOrders() {
    const term = document.getElementById('dash-search').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        o.customer.toLowerCase().includes(term) || 
        (o.id && o.id.toLowerCase().includes(term))
    );
    displayOrders(filtered);
}

// ORDER SYSTEM WITH CUSTOMER DETAILS
function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;

    if (!name || !phone) return alert("Please enter Customer Name and Phone Number.");
    if (!cart.length) return alert("Your order is empty!");

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = "ASH-" + Date.now().toString().slice(-6);

    // PUSH TO CLOUD
    database.ref('orders').push({
        id: orderId,
        date: new Date().toLocaleString(),
        customer: name,
        phone: phone,
        items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: total
    });

    // PROFESSIONAL WP MESSAGE
    let msg = `*ASHIRBAD HARDWARE RECEIPT*%0A`;
    msg += `---------------------------%0A`;
    msg += `*Order ID:* ${orderId}%0A`;
    msg += `*Customer:* ${name}%0A`;
    msg += `*Phone:* ${phone}%0A`;
    msg += `---------------------------%0A`;
    cart.forEach((i, idx) => msg += `${idx+1}. ${i.name} (x${i.quantity})%0A`);
    msg += `---------------------------%0A`;
    msg += `*GRAND TOTAL: ₹${total}*%0A`;
    msg += `---------------------------%0A`;
    msg += `Thank you for shopping at Chandpara Store!`;

    window.open(`https://wa.me/919547675034?text=${msg}`);
}

// OWNER DASHBOARD
function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) {
            document.getElementById('salesBody').innerHTML = "<tr><td colspan='5'>No orders found</td></tr>";
            return;
        }
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        
        document.getElementById('totalSalesCount').innerText = allOrders.length;
        document.getElementById('totalRevenue').innerText = `₹${allOrders.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
        
        displayOrders(allOrders);
    });
}

function displayOrders(list) {
    const body = document.getElementById('salesBody');
    body.innerHTML = list.map(s => `
        <tr>
            <td><span style="color:#888;">#${s.id || 'N/A'}</span><br>${s.date}</td>
            <td><b>${s.customer}</b><br><span style="color:var(--blue);">${s.phone}</span></td>
            <td>${s.items}</td>
            <td><b>₹${s.total}</b></td>
            <td><button onclick="deleteOrder('${s.dbId}')" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).reverse().join('');
}

function deleteOrder(id) { if(confirm("Confirm: Delete this record?")) database.ref('orders/' + id).remove(); }

// UI TOGGLES
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function openLoginModal() { closeModal(); document.getElementById('loginModal').style.display = 'flex'; }
function handleLogin() {
    if (document.getElementById('adminUser').value === ADMIN_CRED.user && document.getElementById('adminPass').value === ADMIN_CRED.pass) {
        closeModal();
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    } else alert("Access Denied");
}
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function closeDashboard() { document.getElementById('adminDashboard').style.display = 'none'; }
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++; else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}
function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:0.85rem;"><span>${i.name} x${i.quantity}</span><span>₹${i.price*i.quantity}</span></div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}
function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    const container = document.getElementById('product-list');
    container.innerHTML = filtered.map(item => `
        <div class="product-card">
            <span style="color:#2ecc71; font-size:0.7rem; font-weight:bold;"><i class="fas fa-check-circle"></i> In stock</span>
            <img src="images/${item.img}" alt="${item.name}">
            <h4 style="margin: 8px 0; font-size: 0.85rem;">${item.name}</h4>
            <p style="color:var(--blue); font-weight:800;">₹${item.price}</p>
            <button class="blue-btn" style="padding:10px; font-size:0.75rem;" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

loadProducts();
