function togglePasswordVisibility() {
    var passwordField = document.getElementById("password");
    var passwordToggle = document.getElementById("password-toggle");
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        passwordToggle.textContent = "👁️"; 
    } else {
        passwordField.type = "password";
        passwordToggle.textContent = "👁️"; 
    }
}
