let products = [];
let cart = [];
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch('products.json');
        products = await res.json();
        filterProducts();
    } catch (e) { console.error("Error loading products", e); }
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('show-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('show-r'); }
function toggleFooter(btn) { 
    const panel = btn.nextElementSibling;
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <span class="stock-badge">In stock</span>
            <img src="images/${item.img}" alt="${item.name}" onclick="openLightbox(${item.id})">
            <h4 style="margin: 8px 0 2px; font-size: 0.85rem;">${item.name}</h4>
            <p style="color: var(--primary); font-weight: bold; margin: 0;">₹${item.price}</p>
            <button onclick="addToCart(${item.id})" style="width:100%; background:var(--primary); color:white; border:none; margin-top:8px; padding:6px; border-radius:3px;">Add to Cart</button>
        </div>
    `).join('');
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
    
    const feat = products.filter(p => (p.featured === true || p.featured === "TRUE") && currentCategory === 'all' && term === "");
    document.getElementById('featured-section').style.display = feat.length ? 'block' : 'none';
    renderProducts(feat, 'featured-list');
}

function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });
    updateCartUI();
    if (!document.getElementById('cart-panel').classList.contains('show-r')) toggleCart();
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    list.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; font-size:0.85rem;">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById('cart-total').innerText = `Total: ₹${total}`;
}

function sendToWhatsApp() {
    if (!cart.length) return alert("Cart is empty");
    let msg = "*Order - Chandpara Shop*%0A";
    cart.forEach(i => msg += `${i.name} x${i.quantity} = ₹${i.price * i.quantity}%0A`);
    msg += `*Total: ₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
}

loadProducts();
