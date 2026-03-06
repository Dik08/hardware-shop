// 1. Your Product Data (Update this as you grow)
const products = [
    { id: 1, name: "Heavy Duty Hammer", price: 350, img: "hammer.jpg" },
    { id: 2, name: "Philips LED Bulb 9W", price: 120, img: "bulb.jpg" },
    { id: 3, name: "Paint Brush 4-inch", price: 85, img: "brush.jpg" }
];

let cart = [];

// 2. Render Products to Screen
const productList = document.getElementById('product-list');
products.forEach(product => {
    productList.innerHTML += `
        <div class="product-card">
            <h4>${product.name}</h4>
            <p>₹${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;
});

// 3. Add Item to Cart
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    renderCart();
}

// 4. Send to WhatsApp
function sendToWhatsApp() {
    const phone = "91XXXXXXXXXX"; // Your WhatsApp Number with Country Code
    let message = "New Order from Website:%0A";
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ₹${item.price}%0A`;
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `%0A*Total: ₹${total}*`;

    const whatsappURL = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

function renderCart() {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = cart.map(item => `<li>${item.name} - ₹${item.price}</li>`).join('');
}