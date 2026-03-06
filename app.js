// 1. DATABASE: Update these to match your uploaded filenames exactly
const products = [
    { 
        id: 1, 
        name: "Tata Agrico Hammer", 
        price: 350, 
        img: "hammer.jpg", 
        category: "tools" 
    },
    { 
        id: 2, 
        name: "Philips LED Bulb 9W", 
        price: 120, 
        img: "bulb.jpg", 
        category: "electrical" 
    },
    { 
        id: 3, 
        name: "Asian Paints TruCare Roller", 
        price: 85, 
        img: "roller.jpg", 
        category: "paint" 
    },
    { 
        id: 4, 
        name: "Finolex 1.5sqmm Wire", 
        price: 1450, 
        img: "wire.jpg", 
        category: "electrical" 
    }
];

let cart = [];

// 2. RENDER FUNCTION: This creates the HTML for each product card
function renderProducts(productsToDisplay) {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    container.innerHTML = "";

    productsToDisplay.forEach(item => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${item.img}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
                <button class="add-btn" onclick="addToCart(${item.id})">Add to Order</button>
            </div>
        `;
    });
}

// 3. SEARCH FUNCTION: Real-time filtering
function searchProducts() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term)
    );
    renderProducts(filtered);
}

// 4. CART LOGIC
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p style="color: #888; font-size: 0.9rem;">Your cart is empty.</p>';
    } else {
        cartList.innerHTML = cart.map(item => `<li><span>${item.name}</span> <span>₹${item.price}</span></li>`).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDisplay.innerText = `Total: ₹${total}`;
}

// 5. WHATSAPP CHECKOUT: Opens WhatsApp with the order details
function sendToWhatsApp() {
    if (cart.length === 0) return alert("Please add items to your cart first!");

    // Replace with your real number (91 for India + 10 digit number)
    const myNumber = "91XXXXXXXXXX"; 
    let message = "*New Hardware Order*%0A------------------%0A";
    
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} - ₹${item.price}%0A`;
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `------------------%0A*Grand Total: ₹${total}*%0A%0AIs this available at the Chandpara shop?`;

    window.open(`https://wa.me/${myNumber}?text=${message}`, '_blank');
}

// Initial Load
renderProducts(products);
