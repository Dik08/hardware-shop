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
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts(); // Triggers first render
    } catch (e) { console.error("Error fetching data", e); }
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }

function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <span style="color:#2ecc71; font-size:0.7rem; font-weight:bold;"><i class="fas fa-check-circle"></i> In stock</span>
            <img src="images/${item.img}" alt="${item.name}" onclick="viewDetails(${item.id})">
            <h4 style="margin: 8px 0; font-size: 0.8rem;">${item.name}</h4>
            <p style="color:var(--blue); font-weight:bold;">₹${item.price}</p>
            <button class="action-btn" style="padding:8px; font-size:0.7rem;" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>`).join('');
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');

    // FIXED: Correctly populating Best Sellers
    const feat = products.filter(p => (p.featured === true || p.featured === "TRUE") && currentCategory === 'all' && term === "");
    const featSection = document.getElementById('featured-section');
    if (feat.length > 0) {
        featSection.style.display = 'block';
        renderProducts(feat, 'featured-list');
    } else {
        featSection.style.display = 'none';
    }
}

function sendToWhatsApp() {
    if (!cart.length) return alert("Empty!");
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    // Push order to Firebase
    database.ref('orders').push({ 
        date: new Date().toLocaleString(), 
        items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '), 
        total: total 
    });

    let msg = "*ORDER - ASHIRBAD HARDWARE*%0A---------------------------%0A";
    cart.forEach((i, idx) => msg += `*${idx+1}.* ${i.name} (x${i.quantity})%0A`);
    msg += `---------------------------%0A*Total: ₹${total}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
}

function handleLogin() {
    if (document.getElementById('adminUser').value === ADMIN_CRED.user && document.getElementById('adminPass').value === ADMIN_CRED.pass) {
        closeModal();
        document.getElementById('adminDashboard').style.display = 'flex';
        syncDashboard();
    } else alert("Access Denied");
}

function syncDashboard() {
    database.ref('orders').on('value', (snap) => {
        const data = snap.val();
        const salesBody = document.getElementById('salesBody');
        if (!data) {
            salesBody.innerHTML = "<tr><td colspan='4'>No orders found.</td></tr>";
            return;
        }
        const salesArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        document.getElementById('totalSalesCount').innerText = salesArray.length;
        document.getElementById('totalRevenue').innerText = `₹${salesArray.reduce((s, i) => s + i.total, 0).toLocaleString()}`;
        salesBody.innerHTML = salesArray.map(s => `
            <tr>
                <td>${s.date}</td><td>${s.items}</td><td>₹${s.total}</td>
                <td><button onclick="deleteOrder('${s.id}')" style="color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
            </tr>`).reverse().join('');
    });
}

function deleteOrder(id) { if(confirm("Delete order?")) database.ref('orders/' + id).remove(); }
function updateCartUI() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; font-size:0.85rem;"><span>${i.name} x${i.quantity}</span><span>₹${i.price*i.quantity}</span></div>`).join('');
    document.getElementById('cart-total-amt').innerText = `₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}`;
}
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++; else cart.push({ ...item, quantity: 1 });
    updateCartUI();
}
function setCategory(cat) { currentCategory = cat; if(document.getElementById('sidebar').classList.contains('active-l')) toggleSidebar(); filterProducts(); }
function closeModal() { document.querySelectorAll('.modal-root').forEach(m => m.style.display = 'none'); }
function viewDetails(id) {
    const item = products.find(p => p.id === id);
    const modal = document.getElementById('productModal');
    modal.innerHTML = `<div class="modal-box small"><span onclick="closeModal()" style="float:right; cursor:pointer;">&times;</span><img src="images/${item.img}" style="width:100%; max-height:220px; object-fit:contain;"><h3>${item.name}</h3><p style="color:var(--blue); font-weight:bold;">₹${item.price}</p><button class="action-btn" onclick="addToCart(${item.id}); closeModal();">ADD TO ORDER</button></div>`;
    modal.style.display = 'flex';
}
function closeDashboard() { document.getElementById('adminDashboard').style.display = 'none'; }
loadProducts();
