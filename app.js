// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAfO4vESUV5EweTKwZ8z37xhQAvAptihVI",
  authDomain: "ashirbad-hardware-388ff.firebaseapp.com",
  databaseURL: "https://ashirbad-hardware-388ff-default-rtdb.firebaseio.com",
  projectId: "ashirbad-hardware-388ff",
  appId: "1:28548957243:web:8f8a620d095ce7fb29c81e"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

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

// OWNER TOOLS
function handleAuthLogin() {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => { closeModal(); document.getElementById('adminDashboard').style.display = 'flex'; syncDashboard(); })
        .catch((err) => alert("Access Error: " + err.message));
}

function handleLogout() {
    auth.signOut().then(() => { document.getElementById('adminDashboard').style.display = 'none'; alert("Logged Out"); });
}

function searchOrders() {
    const term = document.getElementById('dash-search').value.toLowerCase();
    const filtered = allOrders.filter(o => (o.customer && o.customer.toLowerCase().includes(term)) || (o.id && o.id.toLowerCase().includes(term)));
    displayOrders(filtered);
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        displayOrders(allOrders);
    });
}

function displayOrders(list) {
    document.getElementById('totalSalesCount').innerText = list.length;
    document.getElementById('totalRevenue').innerText = `₹${list.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
    document.getElementById('salesBody').innerHTML = list.map(s => `
        <tr>
            <td><span style="color:#888;">#${s.id}</span><br>${s.date}</td>
            <td><b>${s.customer}</b><br><span style="color:var(--blue);">${s.phone}</span></td>
            <td style="font-size:0.75rem;">${s.items}</td>
            <td><b>₹${s.total}</b></td>
            <td><i class="fas fa-trash" onclick="deleteOrder('${s.dbId}')" style="color:red; cursor:pointer;"></i></td>
        </tr>`).reverse().join('');
}

// CUSTOMER TOOLS
function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    if (!name || !phone) return alert("Please enter your name and phone number!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = "ASH" + Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, date: new Date().toLocaleString(), customer: name, phone: phone, items: cart.map(i => i.name).join(', '), total: total });
    window.open(`https://wa.me/919547675034?text=Order ID: ${orderId}%0ACustomer: ${name}%0ATotal: ₹${total}`);
}

function openLocation() { window.open("https://www.google.com/maps?q=Main+Road,+Chandpara,+743245", "_blank"); }

// CORE ENGINE
function renderProducts(list, target) {
    document.getElementById(target).innerHTML = list.map(item => `
        <div class="product-card">
            <span style="color:#2ecc71; font-size:0.7rem; font-weight:bold; display:block; margin-bottom:5px;"><i class="fas fa-check-circle"></i> In stock</span>
            <img src="images/${item.img}" alt="${item.name}">
            <h4 style="margin: 10px 0 5px; font-size: 0.85rem;">${item.name}</h4>
            <p style="color:var(--blue); font-weight:800; font-size:1.1rem; margin:0;">₹${item.price}</p>
            <button class="blue-btn" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
    const feat = products.filter(p => (p.featured === true || p.featured === "TRUE") && currentCategory === 'all' && term === "");
    document.getElementById('featured-section').style.display = feat.length > 0 ? 'block' : 'none';
    renderProducts(feat, 'featured-list');
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++; else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}
function updateCartUI() {
    document.getElementById('cart-items-list').innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee; font-size:0.85rem;"><span>${i.name} x${i.quantity}</span><span>₹${i.price*i.quantity}</span></div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}
function setCategory(cat) { currentCategory = cat; if(document.getElementById('sidebar').classList.contains('active-l')) toggleSidebar(); filterProducts(); }
function openLoginModal() { closeModal(); document.getElementById('loginModal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function deleteOrder(id) { if(confirm("Delete record?")) database.ref('orders/' + id).remove(); }
loadProducts();
