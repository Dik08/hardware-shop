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
        renderList(products);
    } catch (e) { console.error(e); }
}

function renderList(list) {
    document.getElementById('product-list').innerHTML = list.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <div class="card-tag">NEW</div>
            <img src="images/${item.img}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p style="font-weight:bold; font-size:0.75rem;">₹${item.price}</p>
        </div>`).join('');
}

// DASHBOARD LOGIC
function searchOrders() {
    const term = document.getElementById('dash-search-input').value.toLowerCase();
    const filtered = allOrders.filter(o => 
        (o.customer && o.customer.toLowerCase().includes(term)) || 
        (o.id && o.id.toLowerCase().includes(term))
    );
    renderDashboardTable(filtered);
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        if (!data) return;
        allOrders = Object.keys(data).map(key => ({ dbId: key, ...data[key] }));
        renderDashboardTable(allOrders);
    });
}

function renderDashboardTable(list) {
    document.getElementById('totalSalesCount').innerText = list.length;
    document.getElementById('totalRevenue').innerText = `₹${list.reduce((s, o) => s + o.total, 0)}`;
    document.getElementById('salesBody').innerHTML = list.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><b>${o.customer}</b><br><small>${o.phone}</small></td>
            <td>₹${o.total}</td>
            <td><i class="fas fa-trash" onclick="deleteOrder('${o.dbId}')" style="color:red; cursor:pointer;"></i></td>
        </tr>`).reverse().join('');
}

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
    if (!name || !phone) return alert("NAME & PHONE REQUIRED");
    const total = cart.reduce((s, i) => s + i.price, 0);
    const orderId = "ASH" + Date.now().toString().slice(-4);
    database.ref('orders').push({ id: orderId, customer: name, phone: phone, total: total, items: cart.map(i => i.name).join(', ') });
    window.open(`https://wa.me/919547675034?text=ORDER ID: ${orderId}%0ANAME: ${name}%0ATOTAL: ₹${total}`);
}

// TOGGLES
function toggleSearch() { document.getElementById('search-overlay').classList.toggle('active'); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    updateCartUI();
    alert("ADDED TO BAG");
}
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}
function updateCartUI() {
    document.getElementById('cart-items-list').innerHTML = cart.map((i, index) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
            <span>${i.name}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <span>₹${i.price}</span>
                <i class="fas fa-times" onclick="removeFromCart(${index})" style="color:red; cursor:pointer;"></i>
            </div>
        </div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + i.price, 0)}`;
}
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function openLocation() { window.open("https://maps.google.com/?q=Chandpara+Hardware", "_blank"); }
loadProducts();
