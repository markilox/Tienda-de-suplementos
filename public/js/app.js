// Elementos del DOM
const productsContainer = document.getElementById("products-container");
const cartModal = document.getElementById("cart-modal");
const cartIcon = document.getElementById("cart-icon");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElem = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-cart");

// Carrito
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];
let isLoggedIn = false;

// Verificar login al cargar
async function checkLoginStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    isLoggedIn = false;
    return;
  }
  
  try {
    const res = await fetch("/api/users/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    isLoggedIn = res.ok;
  } catch (error) {
    console.log("No hay sesión activa");
  }
}

// Cargar productos desde backend
async function fetchProducts() {
  try {
    console.log(" Cargando productos...");
    const res = await fetch("/api/products");
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    products = await res.json();
    console.log(` ${products.length} productos cargados`);
    renderProducts(products);
    renderCart();
    
  } catch (error) {
    console.error("Error cargando productos:", error);
    productsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <h3 style="color: red;">Error cargando productos</h3>
        <p>${error.message}</p>
        <button onclick="fetchProducts()" style="padding: 10px 20px; margin-top: 20px;">
          Reintentar
        </button>
      </div>
    `;
  }
}

// Render productos
function renderProducts(list) {
  if (!productsContainer) {
    console.error("No se encontró products-container");
    return;
  }
  
  productsContainer.innerHTML = "";
  
  if (list.length === 0) {
    productsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <h3>No hay productos disponibles</h3>
      </div>
    `;
    return;
  }
  
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/300x300?text=Sin+img'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="description">${p.description || 'Sin descripción'}</p>
      <p class="price">€${p.price?.toFixed(2) || '0.00'}</p>
      <p class="stock">Stock: ${p.stock || 0}</p>
      <button data-id="${p._id}" ${(p.stock || 0) <= 0 ? 'disabled style="opacity:0.5"' : ''}>
        ${(p.stock || 0) <= 0 ? 'Sin stock' : 'Añadir al carrito'}
      </button>
    `;
    productsContainer.appendChild(card);
  });
}

// Render carrito
function renderCart() {
  if (!cartItemsContainer || !cartCount || !cartTotalElem) return;
  
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const prod = products.find(p => p._id === item.id);
    if (!prod) return;

    total += (prod.price || 0) * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      ${prod.name} x${item.quantity} - €${((prod.price || 0) * item.quantity).toFixed(2)}
      <button data-id="${item.id}">X</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotalElem.textContent = `Total: €${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Sincronizar item con backend
async function syncCartItem(productId, quantity) {
  const token = localStorage.getItem("token");
  if (!token || !isLoggedIn) return;
  
  try {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        quantity: 1
      })
    });
  } catch (error) {
    console.error("Error sincronizando carrito:", error);
  }
}

// Inicializar
async function init() {
  console.log("Inicializando aplicación...");
  
  await checkLoginStatus();
  await fetchProducts();
  
  // Añadir producto al carrito
  productsContainer.addEventListener("click", async e => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
      const id = e.target.dataset.id;
      const product = products.find(p => p._id === id);
      
      if (!product) return;
      
      // Validar stock
      const existing = cart.find(i => i.id === id);
      const requestedQty = existing ? existing.quantity + 1 : 1;
      
      if (product.stock < requestedQty) {
        alert(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        return;
      }
      
      // Añadir localmente
      if (existing) existing.quantity++;
      else cart.push({ id, quantity: 1 });
      
      renderCart();
      
      // Sincronizar con backend si está logueado
      if (isLoggedIn) {
        await syncCartItem(id, existing ? existing.quantity : 1);
      }
    }
  });

  // Abrir/cerrar carrito
  cartIcon?.addEventListener("click", (e) => {
    e.stopPropagation();
    cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
  });

  // Eliminar producto del carrito
  cartItemsContainer?.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
      const id = e.target.dataset.id;
      cart = cart.filter(i => i.id !== id);
      renderCart();
    }
  });

  // Vaciar carrito
  clearCartBtn?.addEventListener("click", () => {
    cart = [];
    renderCart();
  });

  // Aplicar filtros
  document.getElementById("apply-filters")?.addEventListener("click", () => {
    const category = document.getElementById("category")?.value || "";
    const minPrice = parseFloat(document.getElementById("min-price")?.value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price")?.value) || Infinity;

    const filtered = products.filter(p => {
      const price = p.price || 0;
      return (category === "" || p.category === category) &&
             price >= minPrice &&
             price <= maxPrice;
    });

    renderProducts(filtered);
  });

  // Checkout
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

  // Cerrar modal al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (cartModal?.style.display === "block") {
      if (!cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
        cartModal.style.display = "none";
      }
    }
  });
}

async function processCheckout() {
  const token = localStorage.getItem("token");
  
  try {
    // 1. Sincronizar carrito local con backend
    for (const item of cart) {
      await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity
        })
      });
    }
    
    // 2. Realizar checkout
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
      throw new Error(data.message || "Error en checkout");
    }
    
    // 3. Recargar productos para actualizar stock
    await fetchProducts();
    
    // 4. Mostrar confirmación
    alert(`Compra realizada!\nPedido #${data.order._id}\nTotal: €${data.order.total.toFixed(2)}`);
    
    // 5. Limpiar carrito
    cart = [];
    localStorage.removeItem("cart");
    renderCart();
    cartModal.style.display = "none";
    
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", init);