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

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active-l'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active-r'); }
function toggleFPanel(btn) { 
    const panel = btn.nextElementSibling;
    panel.style.display = panel.style.display === "block" ? "none" : "block";
}

function renderProducts(list, target) {
    const container = document.getElementById(target);
    container.innerHTML = list.map(item => `
        <div class="product-card">
            <img src="images/${item.img}" alt="${item.name}" onclick="openLightbox(${item.id})">
            <span class="in-stock-badge" style="color:#2ecc71; font-size:0.75rem;"><i class="fas fa-check-circle"></i> In stock</span>
            <h4 style="margin: 8px 0 2px; font-size: 0.85rem; height: 35px; overflow: hidden;">${item.name}</h4>
            <p style="color: var(--brand-red); font-weight: 800; margin: 0;">₹${item.price}</p>
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
    } else {
        featSection.style.display = 'none';
    }
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
        <div style="display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #eee; font-size:0.8rem;">
            <span><strong>${item.name}</strong><br>Qty: ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById('cart-total-amt').innerText = `₹${total}`;
}

function clearCart() { if(confirm("Empty your cart?")) { cart = []; updateCartUI(); } }

function setCategory(cat) {
    currentCategory = cat;
    if(document.getElementById('sidebar').classList.contains('active-l')) toggleSidebar();
    filterProducts();
}

function sendToWhatsApp() {
    if (!cart.length) return alert("Your cart is empty!");
    let msg = "*ORDER FROM CHANDPARA SHOP*%0A";
    cart.forEach(i => msg += `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}%0A`);
    msg += `%0A*TOTAL AMOUNT: ₹${cart.reduce((s, i) => s + (i.price * i.quantity), 0)}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`);
}

loadProducts();
