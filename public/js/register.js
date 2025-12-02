document.getElementById("register").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("input[name='name']").value;
  const email = document.querySelector("input[name='email']").value;
  const password = document.querySelector("input[name='password']").value;

  const backendError = document.getElementById("backend-error");
  backendError.style.display = "none";
  backendError.textContent = "";

  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    backendError.style.display = "block";
    backendError.textContent = data.message;
    return;
  }

  window.location.href = "/login.html";
});
