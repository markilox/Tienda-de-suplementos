const cartIcon = document.getElementById("cart-icon");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElem = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-cart");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  if (!cartItemsContainer || !cartCount || !cartTotalElem) return;
  
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span style="color: #333;">${item.name || `Producto ${item.id}`}</span>
      <div>
        <span style="color: #666;">x${item.quantity}</span>
        <span style="color: #333; font-weight: bold; margin: 0 10px;">€${(item.price * item.quantity).toFixed(2)}</span>
        <button data-id="${item.id}" style="
          background: rgb(0, 158, 82);
          color: white;
          border: none;
          padding: 2px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.8rem;
        ">X</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
    
    total += item.price * item.quantity;
  });

  cartTotalElem.textContent = `Total: €${total.toFixed(2)}`;
  cartTotalElem.style.color = "#333";
  cartTotalElem.style.fontWeight = "bold";
  
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

cartIcon?.addEventListener("click", (e) => {
  e.stopPropagation();
  cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
});

cartItemsContainer?.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    const id = e.target.dataset.id;
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});

clearCartBtn?.addEventListener("click", () => {
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
});

checkoutBtn?.addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }
  
  const token = localStorage.getItem("token");
  
  if (!token) {
    localStorage.setItem("pendingCart", JSON.stringify(cart));
    window.location.href = "/login.html";
    return;
  }
  
  await processCheckout();
});

document.addEventListener("click", (e) => {
  if (cartModal?.style.display === "block") {
    if (!cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
      cartModal.style.display = "none";
    }
  }
});

function addToCart(product, quantity = 1, flavor = null) {
  const existing = cart.find(i => i.id === product._id && i.flavor === flavor);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      flavor: flavor,
      image: product.image
    });
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  
  showNotification(`✅ ${product.name} añadido al carrito`);
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgb(0, 255, 133);
    color: rgb(18, 26, 45);
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 0 25px rgb(0, 255, 133, 0.5);
    animation: slideIn 0.3s ease;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid rgb(0, 255, 133);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});