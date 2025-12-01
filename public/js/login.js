document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("input[name='email']").value;
  const password = document.querySelector("input[name='password']").value;

  const errorElem = document.getElementById("login-error");
  errorElem.style.display = "none";
  errorElem.textContent = "";

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

  // Redirigir al carrito o home
  window.location.href = "/index.html";
});
