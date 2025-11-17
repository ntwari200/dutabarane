// URL of your backend
const BACKEND_URL = "http://localhost:5000";

// Login function
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageElement = document.getElementById("message");

    // Basic validation
    if (!username || !password) {
        messageElement.style.color = "red";
        messageElement.innerText = "Please enter both username and password.";
        return;
    }

    try {
        // Send login request to backend
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Login successful
            messageElement.style.color = "green";
            messageElement.innerText = data.message;
        } else {
            // Login failed
            messageElement.style.color = "red";
            messageElement.innerText = data.message;
        }
    } catch (error) {
        // Backend connection error
        messageElement.style.color = "red";
        messageElement.innerText = "Error connecting to backend.";
        console.error("Login error:", error);
    }
}

// Optional: Press Enter to submit login
document.getElementById("password").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        login();
    }
});
