let products = [];
let cart = [];
let currentCategory = 'all';
const ADMIN_CRED = { user: "admin", pass: "dik2026" };
let salesHistory = JSON.parse(localStorage.getItem('owner_sales') || '[]');

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error("Error loading products", e); }
}

// UI Controls
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function openLoginModal() { toggleSidebar(); document.getElementById('loginModal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function closeDashboard() { document.getElementById('adminDashboard').style.display = 'none'; }

function handleLogin() {
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;
    if(u === ADMIN_CRED.user && p === ADMIN_CRED.pass) {
        closeLoginModal();
        document.getElementById('adminDashboard').style.display = 'flex';
        updateDashboardStats();
    } else { alert("Access Denied"); }
}

function updateDashboardStats() {
    const totalRev = salesHistory.reduce((s, i) => s + i.total, 0);
    document.getElementById('totalSalesCount').innerText = salesHistory.length;
    document.getElementById('totalRevenue').innerText = `₹${totalRev}`;
    const body = document.getElementById('salesBody');
    body.innerHTML = salesHistory.map(s => `<tr><td>${s.date}</td><td>${s.items}</td><td>₹${s.total}</td></tr>`).reverse().join('');
}

function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <img src="images/${item.img}" alt="${item.name}">
            <span style="color:var(--success); font-size:0.75rem; font-weight:bold;"><i class="fas fa-check-circle"></i> In stock</span>
            <h4 style="margin: 10px 0 5px; font-size: 0.9rem;">${item.name}</h4>
            <p style="color: var(--brand-blue); font-weight: 800; margin-bottom: 10px;">₹${item.price}</p>
            <button class="pro-add-btn" onclick="addToCart(${item.id})">ADD TO CART</button>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
    const feat = products.filter(p => (p.featured === true || p.featured === "TRUE") && currentCategory === 'all' && term === "");
    const featSection = document.getElementById('featured-section');
    if (feat.length > 0) {
        featSection.style.display = 'block';
        renderProducts(feat, 'featured-list');
    } else { featSection.style.display = 'none'; }
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
    list.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
            <span><strong>${item.name}</strong> x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>`).join('');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById('cart-total-amt').innerText = `₹${total}`;
}

function clearCart() { if(confirm("Clear Order List?")) { cart = []; updateCartUI(); } }

function sendToWhatsApp() {
    if (!cart.length) return alert("Cart is empty!");
    const totalAmt = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const newSale = {
        date: new Date().toLocaleDateString(),
        items: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: totalAmt
    };
    salesHistory.push(newSale);
    localStorage.setItem('owner_sales', JSON.stringify(salesHistory));
    
    let msg = "*ORDER FROM CHANDPARA SHOP*%0A";
    cart.forEach(i => msg += `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}%0A`);
    msg += `%0A*TOTAL: ₹${totalAmt}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
}

loadProducts(); 
