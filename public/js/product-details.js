document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = "/index.html";
    return;
  }
  
  const product = await loadProduct(productId);
  if (!product) return;
  
  renderProduct(product);
  
  setupEventListeners(product);
  
  loadRelatedProducts(product.category, productId);
});

async function loadProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");
    return await res.json();
  } catch (error) {
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
          transition: all 0.3s ease;
        ">
          Volver al catálogo
        </a>
      </div>
    `;
    return null;
  }
}

function renderProduct(product) {
  document.title = `${product.name} - Tienda de Suplementos`;
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-name-breadcrumb").textContent = product.name;
  
  const categoryLink = document.getElementById("category-link");
  categoryLink.textContent = product.category || "Categoría";
  if (product.category) {
    categoryLink.href = `/index.html?category=${encodeURIComponent(product.category)}`;
  }
  
  const stockElem = document.getElementById("product-stock");
  stockElem.textContent = `Stock: ${product.stock || 0} unidades`;
  if ((product.stock || 0) <= 0) {
    stockElem.style.color = "#ff6b6b";
  }
  
  document.getElementById("product-price").textContent = 
    `€${(product.price || 0).toFixed(2)}`;
  
  const description = product.description || "Sin descripción disponible";
  document.getElementById("product-description").textContent = description;
  document.getElementById("full-description").textContent = description;
  
  renderProductImages(product);
  
  renderFlavors(product);
  
  renderIngredients(product);
}

function renderProductImages(product) {
  const gallery = document.getElementById("product-gallery");
  gallery.innerHTML = "";
  
  const mainImg = document.createElement("img");
  mainImg.className = "main-image";
  mainImg.src = product.image || "https://via.placeholder.com/600x600/121a2d/00ff85?text=Sin+imagen";
  mainImg.alt = product.name;
  mainImg.id = "main-product-image";
  
  const thumbnails = document.createElement("div");
  thumbnails.className = "thumbnail-container";
  
  const thumb = document.createElement("img");
  thumb.className = "thumbnail active";
  thumb.src = product.image || "https://via.placeholder.com/150x150/121a2d/00ff85?text=Imagen";
  thumb.alt = product.name;
  thumb.onclick = () => {
    document.getElementById("main-product-image").src = thumb.src;
    document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
  };
  
  thumbnails.appendChild(thumb);
  
  const exampleImages = [
    "https://via.placeholder.com/150x150/121a2d/00ff85?text=Angulo+1",
    "https://via.placeholder.com/150x150/121a2d/00ff85?text=Angulo+2",
    "https://via.placeholder.com/150x150/121a2d/00ff85?text=Etiqueta"
  ];
  
  exampleImages.forEach(imgSrc => {
    const thumb = document.createElement("img");
    thumb.className = "thumbnail";
    thumb.src = imgSrc;
    thumb.onclick = () => {
      document.getElementById("main-product-image").src = imgSrc;
      document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    };
    thumbnails.appendChild(thumb);
  });
  
  gallery.appendChild(mainImg);
  gallery.appendChild(thumbnails);
}

function renderFlavors(product) {
  const container = document.getElementById("flavor-options");
  
  const flavors = {
    "suplementos": ["Vainilla", "Chocolate", "Fresa", "Cookies & Cream", "Natural"],
    "ropa": ["Negro", "Blanco", "Gris", "Azul", "Rojo"],
    "accesorios": ["Único"]
  };
  
  const productFlavors = flavors[product.category] || ["Único"];
  
  container.innerHTML = productFlavors.map(flavor => `
    <div class="flavor-option" data-flavor="${flavor}">
      ${flavor}
    </div>
  `).join("");
  
  if (container.firstChild) {
    container.firstChild.classList.add("selected");
  }
}

function renderIngredients(product) {
  const list = document.getElementById("ingredients-list");
  
  const ingredients = [
    "Proteína de suero de leche concentrada",
    "Cacao en polvo",
    "Edulcorantes naturales",
    "Espesante (goma guar)",
    "Aroma de vainilla",
    "Vitaminas (B6, B12)"
  ];
  
  list.innerHTML = ingredients.map(ing => `<li>${ing}</li>`).join("");
  
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = `
    <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <div style="color: #FFD700; margin-bottom: 5px;">★★★★☆</div>
      <p style="font-style: italic;">"Excelente producto, muy buena calidad."</p>
      <div style="color: rgb(0, 255, 133); font-size: 0.9rem; margin-top: 10px;">- Juan P.</div>
    </div>
    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <div style="color: #FFD700; margin-bottom: 5px;">★★★★★</div>
      <p style="font-style: italic;">"Mejor sabor que otras marcas, lo recomiendo."</p>
      <div style="color: rgb(0, 255, 133); font-size: 0.9rem; margin-top: 10px;">- María L.</div>
    </div>
  `;
}

function setupEventListeners(product) {
  document.querySelectorAll(".flavor-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".flavor-option").forEach(o => 
        o.classList.remove("selected"));
      option.classList.add("selected");
    });
  });
  
  const minusBtn = document.querySelector(".qty-btn.minus");
  const plusBtn = document.querySelector(".qty-btn.plus");
  const quantityInput = document.getElementById("quantity");
  
  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });
  }
  
  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      let value = parseInt(quantityInput.value);
      const maxStock = Math.min(product.stock || 10, 10);
      if (value < maxStock) {
        quantityInput.value = value + 1;
      } else if (value >= maxStock) {
        alert(`Máximo ${maxStock} unidades disponibles`);
      }
    });
  }
  
  if (quantityInput) {
    quantityInput.addEventListener("change", function() {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) this.value = 1;
      
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
      const quantity = parseInt(quantityInput?.value || 1);
      const selectedFlavor = document.querySelector(".flavor-option.selected")?.dataset.flavor;
      
      if ((product.stock || 0) <= 0) {
        alert("Producto agotado");
        return;
      }
      
      if (quantity > (product.stock || 0)) {
        alert(`Stock insuficiente. Solo quedan ${product.stock || 0} unidades.`);
        return;
      }
      
      if (typeof addToCart === 'function') {
        addToCart(product, quantity, selectedFlavor);
      } else {
        alert("Producto añadido al carrito");
      }
    });
  }
  
  const buyNowBtn = document.getElementById("buy-now-btn");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      const quantity = parseInt(quantityInput?.value || 1);
      const selectedFlavor = document.querySelector(".flavor-option.selected")?.dataset.flavor;
      
      if ((product.stock || 0) <= 0) {
        alert("Producto agotado");
        return;
      }
      
      if (quantity > (product.stock || 0)) {
        alert(`Stock insuficiente. Solo quedan ${product.stock || 0} unidades.`);
        return;
      }
      
      if (typeof addToCart === 'function') {
        addToCart(product, quantity, selectedFlavor);
      }
      
      setTimeout(() => {
        window.location.href = "/index.html?checkout=true";
      }, 500);
    });
  }
  
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      
      document.querySelectorAll(".tab-btn").forEach(b => 
        b.classList.remove("active"));
      btn.classList.add("active");
      
      document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
        if (content.id === `tab-${tabId}`) {
          content.classList.add("active");
        }
      });
    });
  });
}

async function loadRelatedProducts(category, excludeId) {
  try {
    const res = await fetch(`/api/products`);
    const allProducts = await res.json();
    
    const related = allProducts
      .filter(p => p.category === category && p._id !== excludeId)
      .slice(0, 4);
    
    const container = document.getElementById("related-products");
    
    if (!related || related.length === 0) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: rgb(180,180,180);">No hay productos relacionados en esta categoría</p>`;
      return;
    }
    
    container.innerHTML = related.map(product => `
      <div class="related-product-card">
        <a href="/product.html?id=${product._id}">
          <img src="${product.image || 'https://via.placeholder.com/220x180/121a2d/00ff85?text=Producto'}" 
               alt="${product.name}"
               style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px;">
          <h4 style="color: white; margin: 10px 0; font-size: 1.1rem;">${product.name}</h4>
          <p class="price" style="color: rgb(0, 255, 133); font-size: 1.3rem; font-weight: bold;">€${(product.price || 0).toFixed(2)}</p>
        </a>
      </div>
    `).join("");
    
  } catch (error) {
    console.error("Error cargando productos relacionados:", error);
  }
}