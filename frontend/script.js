// Select elements
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const formBox = document.querySelector(".form-box");

// Warning message container
let warningContainer = document.createElement("div");
warningContainer.className = "warning-message";
warningContainer.innerHTML = `
    <img class="warning-icon" src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png" alt="Warning Icon">
    <span>Invalid username or password!</span>
`;
formBox.appendChild(warningContainer);
warningContainer.style.display = "none";

// Spinner GIF
let spinner = document.createElement("span");
spinner.className = "spinner";
spinner.style.display = "none";
message.appendChild(spinner);

// Login form submit
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Show loading
    message.textContent = "Connecting... ";
    spinner.style.display = "inline-block";

    try {
        const response = await fetch("https://dutabarane-backend.onrender.com/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        spinner.style.display = "none";

        if (data.success) {
            warningContainer.style.display = "none";
            message.textContent = "Login successful!";
            message.style.color = "lightgreen";

            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", username);

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            showWarning(data.message || "Invalid credentials!");
        }
    } catch (err) {
        spinner.style.display = "none";
        showWarning("Cannot connect to server!");
        console.error(err);
    }
});

// Function to show warning message with shake + pulse effect
function showWarning(text) {
    warningContainer.style.display = "flex";
    warningContainer.querySelector("span").textContent = text;
    message.textContent = text;
    message.style.color = "red";

    // Shake effect
    formBox.classList.add("shake");
    setTimeout(() => formBox.classList.remove("shake"), 500);

    // Pulse animation
    warningContainer.classList.add("pulse");
    setTimeout(() => warningContainer.classList.remove("pulse"), 1500);
}
