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

// THEME TOGGLES
function toggleSearch() { document.getElementById('search-overlay').classList.toggle('active'); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }

function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="discount-tag">NEW ARRIVAL</div>
            <img src="images/${item.img}" alt="${item.name}">
            <div class="card-info">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
        </div>`).join('');
}

// DASHBOARD LOGIC
function handleAuthLogin() {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    auth.signInWithEmailAndPassword(email, pass).then(() => {
        closeModal();
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    }).catch(err => alert(err.message));
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        document.getElementById('totalSalesCount').innerText = allOrders.length;
        document.getElementById('totalRevenue').innerText = `₹${allOrders.reduce((s, o) => s + o.total, 0)}`;
        document.getElementById('salesBody').innerHTML = allOrders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customer}</td>
                <td>₹${o.total}</td>
                <td><button onclick="deleteOrder('${o.dbId}')">DEL</button></td>
            </tr>`).reverse().join('');
    });
}

function sendToWhatsApp() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    if (!name || !phone) return alert("NAME/PHONE REQUIRED");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, customer: name, phone: phone, total: total });
    window.open(`https://wa.me/919547675034?text=ORDER ID: ${orderId}%0ANAME: ${name}%0ATOTAL: ₹${total}`);
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
}

function setCategory(cat) { currentCategory = cat; toggleSidebar(); filterProducts(); }
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + i.price, 0)}`;
    alert(`${item.name} ADDED TO BAG`);
}
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
loadProducts();
