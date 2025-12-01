document.getElementById("register").addEventListener("submit", function(e) {
    const pass1 = document.getElementById("pass1").value;
    const pass2 = document.getElementById("pass2").value;

    if (pass1 !== pass2) {
        e.preventDefault();
        document.getElementById("error").style.display = "block";
    }
});