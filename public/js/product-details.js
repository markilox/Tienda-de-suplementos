
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Página de producto cargando...");
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    console.error("No hay ID de producto en la URL");
    window.location.href = "/index.html";
    return;
  }
  
  console.log("Buscando producto ID:", productId);
  
  const product = await loadProduct(productId);
  if (!product) return;
  
  renderProduct(product);
  
  setupEventListeners(product);
  
  console.log("Página de producto lista");
});

async function loadProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Producto no encontrado`);
    }
    
    const product = await res.json();
    console.log("Producto cargado:", product.name);
    console.log("Imagen del producto:", product.image);
    return product;
    
  } catch (error) {
    console.error("Error cargando producto:", error);
    
    document.querySelector(".product-detail-container").innerHTML = `
      <div style="text-align: center; padding: 100px 20px; color: white;">
        <h2 style="color: rgb(0, 255, 133); margin-bottom: 20px;">Producto no encontrado</h2>
        <p style="margin-bottom: 30px;">${error.message}</p>
        <a href="/index.html" style="
          display: inline-block;
          padding: 12px 25px;
          background: rgb(0, 255, 133);
          color: rgb(18, 26, 45);
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          box-shadow: 0 0 15px rgb(0, 255, 133, 0.4);
        ">
          Volver al catálogo
        </a>
      </div>
    `;
    return null;
  }
}

function renderProduct(product) {
  document.title = `${product.name} - Nutramax`;
  
  document.getElementById("product-name-breadcrumb").textContent = product.name;
  
  const categoryLink = document.getElementById("category-link");
  categoryLink.textContent = product.category || "Categoría";
  if (product.category) {
    categoryLink.href = `/index.html?category=${encodeURIComponent(product.category)}`;
  }
  
  const productImage = document.getElementById("product-image");
  if (productImage) {
    let imageSrc;
    
    if (product.image && product.image.trim() !== '') {
      if (product.image.startsWith('http') || product.image.startsWith('data:')) {
        imageSrc = product.image;
      } else {
        imageSrc = `../img/${product.image}`;
      }
    } else {
      imageSrc = 'https://via.placeholder.com/400x400/121a2d/00ff85?text=Sin+imagen';
    }
    
    console.log("Estableciendo imagen:", imageSrc);
    productImage.src = imageSrc;
    productImage.alt = product.name || "Producto";
    
    productImage.onerror = function() {
      console.warn("Imagen no encontrada, usando placeholder");
      this.src = 'https://via.placeholder.com/400x400/121a2d/00ff85?text=Sin+imagen';
      this.onerror = null; 
    };
  }
  
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-price").textContent = `€${(product.price || 0).toFixed(2)}`;
  
  const stockElem = document.getElementById("product-stock");
  stockElem.textContent = `Stock: ${product.stock || 0}`;
  if ((product.stock || 0) <= 0) {
    stockElem.style.color = "#ff6b6b";
  }
  
  const description = product.description || "Sin descripción disponible";
  document.getElementById("product-description").textContent = description;
}

function setupEventListeners(product) {
  const minusBtn = document.querySelector(".qty-btn.minus");
  const plusBtn = document.querySelector(".qty-btn.plus");
  const quantityInput = document.getElementById("quantity");
  
  if (minusBtn && plusBtn && quantityInput) {
    minusBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });
    
    plusBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      const maxStock = Math.min(product.stock || 10, 10);
      
      if (value < maxStock) {
        quantityInput.value = value + 1;
      } else {
        alert(`Máximo ${maxStock} unidades disponibles`);
      }
    });
    
    quantityInput.addEventListener("change", function() {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) {
        this.value = 1;
        return;
      }
      
      const maxStock = Math.min(product.stock || 10, 10);
      if (value > maxStock) {
        this.value = maxStock;
        alert(`Máximo ${maxStock} unidades disponibles`);
      }
    });
  }
  
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(document.getElementById("quantity").value) || 1;
      
      if (product.stock < quantity) {
        alert(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        return;
      }
      
      if (typeof addToCart === 'function') {
        addToCart(product, quantity);
      } else {
        addToCartLocal(product, quantity);
      }
    });
  }
  
  const buyNowBtn = document.getElementById("buy-now-btn");
  if (buyNowBtn) {
    buyNowBtn.disabled = true;
    buyNowBtn.style.opacity = "0.5";
    buyNowBtn.style.cursor = "not-allowed";
  }
}

function addToCartLocal(product, quantity) {
  console.log("Añadiendo al carrito:", product.name, "x", quantity);
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  const existingIndex = cart.findIndex(item => item.id === product._id);
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  updateCartCounter();
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

updateCartCounter();