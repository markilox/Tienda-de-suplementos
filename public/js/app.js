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

// Productos
let products = [];

// Cargar productos desde backend
async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Error cargando productos");
    products = await res.json();
    renderProducts(products);
    renderCart();
  } catch (error) {
    console.error(error);
    productsContainer.innerHTML = "<p>Error cargando productos</p>";
  }
}

// Render productos
function renderProducts(list) {
  productsContainer.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/300x300?text=Sin+imagen'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="description">${p.description}</p>
      <p class="price">€${p.price.toFixed(2)}</p>
      <p class="stock">Stock: ${p.stock}</p>
      <button data-id="${p._id}">Añadir al carrito</button>
    `;
    productsContainer.appendChild(card);
  });
}

// Render carrito
function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const prod = products.find(p => p._id === item.id);
    if (!prod) return;

    total += prod.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      ${prod.name} x${item.quantity} - €${(prod.price * item.quantity).toFixed(2)}
      <button data-id="${item.id}">X</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotalElem.textContent = `Total: €${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);

  localStorage.setItem("cart", JSON.stringify(cart));
}

// Inicial
fetchProducts();

// Añadir producto al carrito
productsContainer.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;

    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({ id, quantity: 1 });

    renderCart();
  }
});

// Abrir carrito
cartIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  cartModal.style.display = "block";
});

// Eliminar producto del carrito
cartItemsContainer.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }
});

// Vaciar carrito
clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

// ===============================
// FILTROS – MIN + MAX PRICE AÑADIDOS
// ===============================
document.getElementById("apply-filters").addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
  const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;

  const filtered = products.filter(p =>
    (category === "" || p.category === category) &&
    p.price >= minPrice &&
    p.price <= maxPrice
  );

  renderProducts(filtered);
});