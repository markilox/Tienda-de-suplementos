document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("input[name='email']").value;
  const password = document.querySelector("input[name='password']").value;

  const errorElem = document.getElementById("login-error");
  errorElem.style.display = "none";
  errorElem.textContent = "";

  try {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorElem.style.display = "block";
      errorElem.textContent = data.message || "Credenciales incorrectas";
      return;
    }

    // Guardar token
    localStorage.setItem("token", data.token);

    // Recuperar carrito pendiente si existe
    const pendingCart = JSON.parse(localStorage.getItem("pendingCart")) || [];
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Usar pendingCart si existe, sino usar localCart
    const cartToSync = pendingCart.length > 0 ? pendingCart : localCart;

    if (cartToSync.length > 0) {
      // Copiar carrito local al backend
      for (const item of cartToSync) {
        await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.token}`
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity
          })
        });
      }
      
      // Limpiar carritos pendientes
      localStorage.removeItem("pendingCart");
      // Mantener localCart actualizado
      localStorage.setItem("cart", JSON.stringify(cartToSync));
    }

    // Redirigir al catálogo
    window.location.href = "/index.html";

  } catch (error) {
    console.error("Login error:", error);
    errorElem.style.display = "block";
    errorElem.textContent = "Error de conexión";
  }
});