let products = []; 
let cart = [];
let currentCategory = 'all';

// 1. Fetch data from products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        filterProducts(); 
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// 2. Analytics: Track what users are looking for in Chandpara
function trackSearch(term) {
    if (term.length < 3) return;
    let history = JSON.parse(localStorage.getItem('shop_analytics') || '[]');
    if (!history.includes(term)) {
        history.push(term);
        localStorage.setItem('shop_analytics', JSON.stringify(history.slice(-10)));
    }
}

// 3. Render Product Cards
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
                    <button class="details-btn" onclick="openLightbox(${item.id})" style="margin-bottom:5px; width:100%; background:none; border:1px solid #ccc; border-radius:4px; cursor:pointer;">Quick View</button>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="qty-${targetId}-${item.id}" value="1" min="1" style="width:50px;" ${isOutOfStock ? 'disabled' : ''}>
                        <button class="add-btn" style="flex-grow:1; background:var(--primary); color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;" ${isOutOfStock ? 'disabled' : ''} 
                            onclick="addToCart(${item.id}, 'qty-${targetId}-${item.id}')">
                            ${isOutOfStock ? '🚫' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// 4. Modal / Details View
function openLightbox(id) {
    const item = products.find(p => p.id === id);
    const modal = document.getElementById('productModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span onclick="closeModal()" style="position:absolute; right:20px; cursor:pointer; font-size:1.5rem;">&times;</span>
            <img src="images/${item.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:15px;">
            <h2>${item.name}</h2>
            <p style="color:var(--accent); font-weight:bold; font-size:1.3rem;">₹${item.price}</p>
            <p style="color:#666; margin:15px 0;">${item.description || 'Quality hardware from our Chandpara store.'}</p>
            <button class="whatsapp-btn" style="background:var(--primary);" onclick="closeModal()">Back to Shop</button>
        </div>`;
    modal.style.display = 'flex';
}

function closeModal() { document.getElementById('productModal').style.display = 'none'; }

// 5. Practical Cart Logic: Grouping quantities
function addToCart(id, qtyInputId) {
    const product = products.find(p => p.id === id);
    const quantity = parseInt(document.getElementById(qtyInputId).value);
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color:#888; text-align:center;">Empty</p>';
    } else {
        let html = `<div class="cart-row cart-header-row"><span>Item</span><span>Qty</span><span>Total</span></div>`;
        html += cart.map(item => `
            <div class="cart-row">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>`).join('');
        cartList.innerHTML = html;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDisplay.innerHTML = `<strong>Grand Total: ₹${total}</strong>`;
}

// 6. Navigation & Messaging (Verified for 9547675034)
function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    if (term) trackSearch(term);
    const filtered = products.filter(p => p.name.toLowerCase().includes(term) && (currentCategory === 'all' || p.category === currentCategory));
    renderProducts(filtered, 'product-list');
}

function sendToWhatsApp() {
    if (cart.length === 0) return alert("Empty Cart!");
    let message = "*New Order - Chandpara Shop*%0A------------------%0A";
    cart.forEach((item, i) => { message += `${i+1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}%0A`; });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `------------------%0A*Total: ₹${total}*`;
    window.open(`https://wa.me/919547675034?text=${message}`, '_blank');
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-item').forEach(el => el.classList.toggle('active', el.innerText.toLowerCase().includes(cat) || (cat==='all' && el.innerText.includes('All'))));
    filterProducts();
}

loadProducts();
