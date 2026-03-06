// 1. DATABASE: Featured items will show up in the "Best Sellers" section
const products = [
    { id: 1, name: "Tata Agrico Hammer", price: 350, img: "hammer.jpg", category: "tools", featured: true },
    { id: 2, name: "Philips LED Bulb 9W", price: 120, img: "bulb.jpg", category: "electrical", featured: false },
    { id: 3, name: "Asian Paints Roller", price: 85, img: "roller.jpg", category: "paint", featured: true },
    { id: 4, name: "Finolex 1.5sqmm Wire", price: 1450, img: "wire.jpg", category: "electrical", featured: true },
    { id: 5, name: "Stanley Screwdriver Set", price: 450, img: "hammer.jpg", category: "tools", featured: false }
];

let cart = [];
let currentCategory = 'all';

// Main function to update the UI based on Search and Categories
function filterProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(term);
        const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered, 'product-list');

    // Manage the Best Sellers section visibility
    const featuredSection = document.getElementById('featured-section');
    if (currentCategory === 'all' && term === "") {
        featuredSection.style.display = 'block';
        const featured = products.filter(p => p.featured);
        renderProducts(featured, 'featured-list');
    } else {
        featuredSection.style.display = 'none';
    }
}

function renderProducts(productsToDisplay, targetId) {
    const container = document.getElementById(targetId);
    container.innerHTML = "";
    productsToDisplay.forEach(item => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${item.img}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
                <div class="action-row">
                    <input type="number" id="qty-${targetId}-${item.id}" value="1" min="1" class="qty-input">
                    <button class="add-btn" onclick="addToCart(${item.id}, 'qty-${targetId}-${item.id}')">Add</button>
                </div>
            </div>`;
    });
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
    document.getElementById(qtyInputId).value = 1; // Reset input
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color: #888; font-size: 0.9rem;">Your cart is empty.</p>';
    } else {
        cartList.innerHTML = cart.map(item => `
            <li>
                <span>${item.name} (x${item.quantity})</span>
                <span>₹${item.price * item.quantity}</span>
            </li>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDisplay.innerText = `Total: ₹${total}`;
}

function sendToWhatsApp() {
    if (cart.length === 0) return alert("Please add items first!");
    const myNumber = "919547675034"; // Your Chandpara shop number
    let message = "*New Order - Chandpara Shop*%0A------------------%0A";
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}%0A`;
    });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `------------------%0A*Total: ₹${total}*%0A%0AOrder via Website.`;
    window.open(`https://wa.me/${myNumber}?text=${message}`, '_blank');
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-item').forEach(el => {
        el.classList.remove('active');
        if(el.innerText.toLowerCase().includes(cat) || (cat === 'all' && el.innerText.includes('All'))) {
            el.classList.add('active');
        }
    });
    filterProducts();
}

// Initial load
filterProducts();
