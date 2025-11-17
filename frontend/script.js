document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.textContent = "Checking...";
    message.style.color = "blue";

    try {
        const response = await fetch("https://dutabarane-backend.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            message.textContent = "Login successful!";
            message.style.color = "green";

            // Redirect (change to your dashboard)
            window.location.href = "dashboard.html";
        } else {
            message.textContent = data.message;
            message.style.color = "red";
        }

    } catch (error) {
        message.textContent = "Error: Cannot connect to server.";
        message.style.color = "red";
        console.error(error);
    }
});
