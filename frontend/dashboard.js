const username = localStorage.getItem("username");
const isLoggedIn = localStorage.getItem("loggedIn");

if (!isLoggedIn) {
    window.location.href = "index.html";
}

document.getElementById("usernameDisplay").textContent = username || "Admin";

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}
