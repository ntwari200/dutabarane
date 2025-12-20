
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.textContent = "Connecting...";
    message.style.color = "yellow";

    try {
        const response = await fetch("https://dutabarane-backend.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            message.textContent = "Login successful!";
            message.style.color = "lightgreen";

            // Store login permanently
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);

            window.location.href = "dashboard.html";
        } else {
            message.textContent = data.message || "Invalid credentials!";
            message.style.color = "red";
        }
    } catch (err) {
        message.textContent = "Cannot connect to server!";
        message.style.color = "red";
        console.error(err);
    }
});
