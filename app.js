let products = []; 
let cart = [];
let currentCategory = 'all';

// Load products and trigger UI immediately
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        filterProducts(); // Initial render for Best Sellers and All Products
    } catch (e) {
        console.error("Data Load Error:", e);
    }
}

// Fixed: Clear Cart Function now properly resets data and UI
function clearCart() {
    if (cart.length === 0) return;
    if (confirm("Clear all items from your list?")) {
        cart = [];
        updateCartUI();
    }
}

function renderProducts(productsToDisplay, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = "";

    productsToDisplay.forEach(item => {
        const isOutOfStock = item.stock <= 0;
        const stockClass = isOutOfStock ? 'out-of-stock' : 'in-stock';
        const stockText = isOutOfStock ? 'Sold Out' : 'In Stock';
        
        container.innerHTML += `
            <div class="product-card">
                <span class="stock-badge ${stockClass}">${stockText}</span>
                <img src="images/${item.img}" alt="${item.name}" onclick="openLightbox(${item.id})">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
                <div class="action-row">
                    <button onclick="openLightbox(${item.id})" style="width:100%; margin-bottom:8px; cursor:pointer; background:none; border:1px solid #ddd; padding:5px; border-radius:4px;">Quick View</button>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="qty-${targetId}-${item.id}" value="1" min="1" style="width:45px;" ${isOutOfStock ? 'disabled' : ''}>
                        <button class="add-btn" style="flex-grow:1; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;" ${isOutOfStock ? 'disabled' : ''} 
                            onclick="addToCart(${item.id}, 'qty-${targetId}-${item.id}')">Add</button>
                    </div>
                </div>
            </div>`;
    });
}

function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    
    // Main Product Filter
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(term);
        const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
        return matchesSearch && matchesCategory;
    });
    renderProducts(filtered, 'product-list');

    // Featured (Best Sellers) Logic
    const featSection = document.getElementById('featured-section');
    if (currentCategory === 'all' && term === "") {
        featSection.style.display = 'block';
        const featured = products.filter(p => p.featured === true || p.featured === "TRUE");
        renderProducts(featured, 'featured-list');
    } else {
        featSection.style.display = 'none';
    }
}

function addToCart(id, qtyInputId) {
    const product = products.find(p => p.id === id);
    const quantity = parseInt(document.getElementById(qtyInputId).value);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color:#888; text-align:center;">Your order list is empty.</p>';
    } else {
        let html = `<div class="cart-row" style="font-weight:bold; border-bottom:2px solid var(--accent);"><span>Item</span><span>Qty</span><span>Total</span></div>`;
        html += cart.map(item => `
            <div class="cart-row">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>`).join('');
        cartList.innerHTML = html;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDisplay.innerHTML = `<strong>Total: ₹${total}</strong>`;
}

function openLightbox(id) {
    let item;
    // Gallery Handler
    if (id === 999) item = { name: "Shop Front", img: "shop_front.jpg", price: "Chandpara", description: "Our shop entrance." };
    else if (id === 998) item = { name: "Inside View", img: "inside_shop.jpg", price: "Visit Us", description: "Explore our aisles." };
    else if (id === 997) item = { name: "Stock", img: "stock_display.jpg", price: "Visit Us", description: "New arrivals daily." };
    else item = products.find(p => p.id === id);

    const modal = document.getElementById('productModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span onclick="closeModal()" style="float:right; cursor:pointer; font-size:24px;">×</span>
            <img src="images/${item.img}" style="width:100%; max-height:280px; object-fit:contain; border-radius:8px;">
            <h2>${item.name}</h2>
            <p style="color:var(--accent); font-weight:bold; font-size:1.2rem;">${item.price.toString().includes('Visit') || item.price.toString().includes('Chandpara') ? item.price : '₹' + item.price}</p>
            <p>${item.description || 'Quality hardware at Chandpara.'}</p>
            <button class="whatsapp-btn" style="background:var(--primary);" onclick="closeModal()">Close Details</button>
        </div>`;
    modal.style.display = 'flex';
}

function closeModal() { document.getElementById('productModal').style.display = 'none'; }

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-item').forEach(el => {
        el.classList.toggle('active', el.innerText.toLowerCase().includes(cat) || (cat === 'all' && el.innerText.includes('All')));
    });
    filterProducts();
}

function sendToWhatsApp() {
    if (cart.length === 0) return alert("Your order list is empty!");
    let msg = "*Order - Chandpara Hardware Shop*%0A";
    cart.forEach((item, i) => { msg += `${i+1}. ${item.name} (x${item.quantity}) = ₹${item.price * item.quantity}%0A`; });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    msg += `*Grand Total: ₹${total}*`;
    window.open(`https://wa.me/919547675034?text=${msg}`, '_blank');
}

loadProducts();
