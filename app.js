let products = []; 
let cart = [];
let currentCategory = 'all';

// Load products from the JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        filterProducts(); 
    } catch (error) {
        console.error("Error loading products.json:", error);
    }
}

// Render function: points to your 'images' folder
function renderProducts(productsToDisplay, targetId) {
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = "";

    productsToDisplay.forEach(item => {
        // Correct path to your Nikon photography folder
        const imagePath = `images/${item.img}`;
        
        container.innerHTML += `
            <div class="product-card">
                <img src="${imagePath}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
                <div class="action-row">
                    <input type="number" id="qty-${targetId}-${item.id}" value="1" min="1" class="qty-input">
                    <button class="add-btn" onclick="addToCart(${item.id}, 'qty-${targetId}-${item.id}')">Add</button>
                </div>
            </div>`;
    });
}

// Filter logic, Cart, and WhatsApp functions (Standardized for 9547675034)
function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
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
    document.getElementById(qtyInputId).value = 1;
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    if (cart.length === 0) {
        cartList.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cartList.innerHTML = cart.map(item => `<li>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</li>`).join('');
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

function sendToWhatsApp() {
    if (cart.length === 0) return alert("Add items first!");
    const myNumber = "919547675034";
    let message = "*New Order - Chandpara Shop*%0A------------------%0A";
    cart.forEach((item, i) => { message += `${i+1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}%0A`; });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `------------------%0A*Total: ₹${total}*%0A%0AOrder via Website.`;
    window.open(`https://wa.me/${myNumber}?text=${message}`, '_blank');
}

loadProducts();
