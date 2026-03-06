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

// 2. Search Analytics: Store locally to see what customers want
function trackSearch(term) {
    if (term.length < 3) return;
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!history.includes(term)) {
        history.push(term);
        localStorage.setItem('searchHistory', JSON.stringify(history.slice(-10)));
    }
}

// 3. Render Product Grid
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
                    <button class="details-btn" onclick="openLightbox(${item.id})">View Details</button>
                    <input type="number" id="qty-${targetId}-${item.id}" value="1" min="1" class="qty-input" ${isOutOfStock ? 'disabled' : ''}>
                    <button class="add-btn" ${isOutOfStock ? 'disabled' : ''} 
                        onclick="addToCart(${item.id}, 'qty-${targetId}-${item.id}')">
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Order'}
                    </button>
                </div>
            </div>`;
    });
}

// 4. Lightbox / Product Details Modal
function openLightbox(id) {
    const item = products.find(p => p.id === id);
    const modal = document.getElementById('productModal');
    
    // Create Modal Content Dynamically
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <img src="images/${item.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:15px;">
            <h2 style="color:var(--primary);">${item.name}</h2>
            <p style="font-size:1.2rem; color:var(--accent); font-weight:bold;">₹${item.price}</p>
            <p style="color:#666; line-height:1.5;">${item.description || 'Premium hardware quality available at our Chandpara store.'}</p>
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
            <p style="font-size:0.8rem; color:#999;">Category: ${item.category.toUpperCase()}</p>
            <button class="whatsapp-btn" style="background:var(--primary);" onclick="closeModal()">Back to Shop</button>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 5. Filtering Logic
function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    trackSearch(term);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(term);
        const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered, 'product-list');

    const featuredSection = document.getElementById('featured-section');
    if (currentCategory === 'all' && term === "") {
        featuredSection.style.display = 'block';
        const featured = products.filter(p => p.featured);
        renderProducts(featured, 'featured-list');
    } else {
        featuredSection.style.display = 'none';
    }
}

// 6. Cart Management
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
        cartList.innerHTML = '<p style="color:#888;">Cart is empty.</p>';
    } else {
        cartList.innerHTML = cart.map(item => `
            <li><span>${item.name} (x${item.quantity})</span><span>₹${item.price * item.quantity}</span></li>
        `).join('');
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDisplay.innerText = `Total: ₹${total}`;
}

function clearCart() { cart = []; updateCartUI(); }

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-item').forEach(el => {
        el.classList.remove('active');
        if(el.innerText.toLowerCase().includes(cat) || (cat === 'all' && el.innerText.includes('All'))) el.classList.add('active');
    });
    filterProducts();
}

// 7. WhatsApp Order (Verified for 9547675034)
function sendToWhatsApp() {
    if (cart.length === 0) return alert("Please add items first!");
    const myNumber = "919547675034";
    let message = "*New Hardware Order - Chandpara*%0A------------------%0A";
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}%0A`;
    });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `------------------%0A*Total Order Value: ₹${total}*%0A%0APlease confirm availability.`;
    window.open(`https://wa.me/${myNumber}?text=${message}`, '_blank');
}

loadProducts();
