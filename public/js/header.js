console.log("header.js cargado");

const cartIcon = document.getElementById("cart-icon");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElem = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-cart");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  if (!cartItemsContainer || !cartCount || !cartTotalElem) {
    console.warn("Elementos del carrito no encontrados");
    return;
  }
  
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name || `Producto ${item.id}`}</span>
      <div>
        <span>x${item.quantity}</span>
        <span>€${(item.price * item.quantity).toFixed(2)}</span>
        <button data-id="${item.id}">X</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
    
    total += item.price * item.quantity;
  });

  cartTotalElem.textContent = `Total: €${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product, quantity = 1, flavor = null) {
  console.log("Añadiendo al carrito:", product.name, "x", quantity);
  
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
  
  showNotification(`${product.name} añadido al carrito`);
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
    font-weight: bold;
    box-shadow: 0 0 25px rgb(0, 255, 133, 0.5);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
  }
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

if (cartIcon) {
  cartIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    if (cartModal) {
      cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
    }
  });
}

if (cartItemsContainer) {
  cartItemsContainer.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
      const id = e.target.dataset.id;
      cart = cart.filter(i => i.id !== id);
      renderCart();
    }
  });
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (confirm("¿Estás seguro de vaciar el carrito?")) {
      cart = [];
      renderCart();
    }
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Por favor, inicia sesión para continuar");
      window.location.href = "/login.html";
      return;
    }
    
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cart })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.insufficientStock) {
          let message = "Stock insuficiente:\n";
          data.insufficientStock.forEach(item => {
            message += `• ${item.name}: Disponible ${item.available}\n`;
          });
          alert(message);
          return;
        }
        throw new Error(data.message || "Error en el checkout");
      }
      
      alert(`Compra realizada!\nTotal: €${data.order.total.toFixed(2)}`);
      
      cart = [];
      renderCart();
      
      if (cartModal) {
        cartModal.style.display = "none";
      }
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
}

document.addEventListener("click", (e) => {
  if (cartModal && cartModal.style.display === "block") {
    if (!cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
      cartModal.style.display = "none";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando carrito...");
  renderCart();
});

window.addToCart = addToCart;
window.renderCart = renderCart;
window.showNotification = showNotification;