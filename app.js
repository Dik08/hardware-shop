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
let allOrders = [];
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error(e); }
}

// TOGGLES
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }

// CART LOGIC
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++; else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center; padding:30px; color:#888;">Order list empty</p>`;
    } else {
        list.innerHTML = cart.map(i => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;">
                <div>
                    <div style="font-weight:600; font-size:0.85rem;">${i.name}</div>
                    <div style="font-size:0.75rem; color:#666;">Qty: ${i.quantity}</div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:bold; color:var(--blue);">₹${i.price * i.quantity}</span>
                    <i class="fas fa-trash-alt" onclick="removeFromCart(${i.id})" style="color:#ff4d4d; cursor:pointer;"></i>
                </div>
            </div>`).join('');
    }
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}

// SEARCH & DASHBOARD
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
            <td><b>${s.customer}</b><br><span style="color:var(--blue); font-size:0.8rem;">${s.phone}</span></td>
            <td style="font-size:0.7rem;">${s.items}</td>
            <td><b>₹${s.total}</b></td>
            <td><i class="fas fa-trash" onclick="deleteOrder('${s.dbId}')" style="color:red; cursor:pointer;"></i></td>
        </tr>`).reverse().join('');
}

function deleteOrder(id) { if(confirm("Delete record?")) database.ref('orders/' + id).remove(); }

// AUTH
function openLoginModal() { closeModal(); document.getElementById('loginModal').style.display = 'flex'; }
function handleLogin() {
    if (document.getElementById('adminUser').value === ADMIN_CRED.user && document.getElementById('adminPass').value === ADMIN_CRED.pass) {
        closeModal(); document.getElementById('adminDashboard').style.display = 'flex'; syncDashboard();
    } else alert("Denied");
}

function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    if (!name || !phone) return alert("Enter Customer Info!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = "ASH" + Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, date: new Date().toLocaleString(), customer: name, phone: phone, items: cart.map(i => i.name).join(', '), total: total });
    let msg = `*ASHIRBAD HARDWARE*%0AID: ${orderId}%0ACustomer: ${name}%0APh: ${phone}%0A---%0A`;
    cart.forEach(i => msg += `• ${i.name} (x${i.quantity})%0A`);
    msg += `---%0A*TOTAL: ₹${total}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
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
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function closeDashboard() { document.getElementById('adminDashboard').style.display = 'none'; }
loadProducts();
