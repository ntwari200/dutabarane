document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const statusBox = document.getElementById("status");
    statusBox.innerText = "Connecting to backend...";
    statusBox.style.color = "yellow";

    try {
        const response = await fetch("https://dutabarane-backend.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            statusBox.innerText = "Login successful!";
            statusBox.style.color = "lightgreen";
            alert("WELCOME ADMIN");

        } else {
            statusBox.innerText = data.error || "Invalid username or password";
            statusBox.style.color = "red";
        }
    } catch (error) {
        statusBox.innerText = "Backend unreachable!";
        statusBox.style.color = "red";
        console.error("Error:", error);
    }
});
