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

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        renderGrid(products);
    } catch (e) { console.error(e); }
}

function renderGrid(list) {
    document.getElementById('product-grid').innerHTML = list.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="sale-badge">SALE</div>
            <img src="images/${item.img}" alt="${item.name}">
            <h4 style="margin:10px 0 0; font-weight:900; font-size:0.8rem; text-transform:uppercase;">${item.name}</h4>
            <p style="margin:5px 0 0; font-weight:bold; font-size:0.75rem;">₹${item.price}</p>
        </div>`).join('');
}

// DASHBOARD SEARCH & SYNC
function searchOrders() {
    const term = document.getElementById('dash-search').value.toLowerCase();
    const filtered = allOrders.filter(o => o.customer.toLowerCase().includes(term) || o.id.includes(term));
    renderTable(filtered);
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        renderTable(allOrders);
    });
}

function renderTable(list) {
    document.getElementById('totalSalesCount').innerText = list.length;
    document.getElementById('totalRevenue').innerText = `₹${list.reduce((s, o) => s + o.total, 0)}`;
    document.getElementById('salesBody').innerHTML = list.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.customer}</td>
            <td>₹${o.total}</td>
            <td><i class="fas fa-trash" onclick="deleteOrder('${o.dbId}')"></i></td>
        </tr>`).reverse().join('');
}

// FIREBASE AUTH
function handleAuthLogin() {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    auth.signInWithEmailAndPassword(email, pass).then(() => {
        closeModal();
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    }).catch(err => alert(err.message));
}

function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    if (!name || !phone) return alert("REQUIRED: NAME & PHONE");
    const total = cart.reduce((s, i) => s + i.price, 0);
    const orderId = Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, customer: name, phone: phone, total: total });
    window.open(`https://wa.me/919547675034?text=ID: ${orderId}%0AName: ${name}%0ATotal: ₹${total}`);
}

// TOGGLES
function toggleSearch() { document.getElementById('search-overlay').classList.toggle('active'); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function addToCart(id) { 
    const item = products.find(p => p.id === id);
    cart.push(item);
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + i.price, 0)}`;
    alert("ADDED TO BAG");
}
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
loadProducts();
