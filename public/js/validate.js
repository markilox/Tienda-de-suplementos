document.getElementById("register").addEventListener("submit", function(e) {
  const pass1 = document.getElementById("pass1").value;
  const pass2 = document.getElementById("pass2").value;

  const passError = document.getElementById("pass-error");

  if (pass1 !== pass2) {
    e.preventDefault();
    passError.style.display = "block";
  } else {
    passError.style.display = "none";
  }
});
