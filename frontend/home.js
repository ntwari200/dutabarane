// ----------------------
// Username Display
// ----------------------
const username = localStorage.getItem("username") || "Admin";
document.getElementById("usernameDisplay").textContent = username;

// ----------------------
// Pop-Up Functions
// ----------------------
function openFilePopup() {
    const popup = document.getElementById("filePopup");
    popup.classList.remove("hidden", "minimized");
    popup.classList.add("show");
    popup.style.transform = "scale(0)";
    setTimeout(() => popup.style.transform = "scale(1)", 10);
    loadFilesTable();
}

function openMemberPopup() {
    const popup = document.getElementById("memberPopup");
    popup.classList.remove("hidden", "minimized");
    popup.classList.add("show");
    popup.style.transform = "scale(0)";
    setTimeout(() => popup.style.transform = "scale(1)", 10);
}

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.style.transform = "scale(0)";
    popup.style.opacity = "0";
    setTimeout(() => {
        popup.classList.remove("show", "minimized");
        popup.classList.add("hidden");
        popup.style.opacity = "";
    }, 300);
}

function minimizePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove("show");
    popup.classList.add("minimized");
}

function maximizePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove("minimized");
    popup.classList.add("show");
}

// ----------------------
// Draggable Popups
// ----------------------
function makeDraggable(popupId) {
    const popup = document.getElementById(popupId);
    const header = popup.querySelector(".popup-header");
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.getBoundingClientRect().left;
        offsetY = e.clientY - popup.getBoundingClientRect().top;
        popup.style.transition = "none";
    });

    document.addEventListener("mouseup", () => { isDragging = false; popup.style.transition = ""; });
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        const maxX = window.innerWidth - popup.offsetWidth;
        const maxY = window.innerHeight - popup.offsetHeight;
        if (x < 0) x = 0; if (y < 0) y = 0;
        if (x > maxX) x = maxX; if (y > maxY) y = maxY;
        popup.style.left = x + "px";
        popup.style.top = y + "px";
    });
}

makeDraggable("filePopup");
makeDraggable("memberPopup");

// ----------------------
// Members Functions
// ----------------------
async function loadMembers() {
    const membersDiv = document.getElementById("membersList");
    membersDiv.innerHTML = "";
    try {
        const res = await fetch("/api/members");
        const members = await res.json();
        members.forEach(m => {
            const div = document.createElement("div");
            div.textContent = `${m.id} - ${m.name} (${m.phone})`;
            div.classList.add("member-row");
            membersDiv.appendChild(div);
        });
    } catch(err) { console.error(err); }
}

async function addMember() {
    const name = document.getElementById("memberName").value.trim();
    const phone = document.getElementById("memberPhone").value.trim();
    if (!name || !phone) return alert("Fill both fields");
    try {
        await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone })
        });
        document.getElementById("memberName").value = "";
        document.getElementById("memberPhone").value = "";
        closePopup("memberPopup");
        loadMembers();
    } catch(err) { console.error(err); }
}

// Filter members list
function filterMembers() {
    const filter = document.getElementById("searchMembers").value.toLowerCase();
    const members = document.querySelectorAll("#membersList .member-row");
    members.forEach(m => {
        m.style.display = m.textContent.toLowerCase().includes(filter) ? "" : "none";
    });
}

// ----------------------
// Files Functions
// ----------------------
async function loadFilesList() {
    const filesDiv = document.getElementById("filesList");
    filesDiv.innerHTML = "";
    try {
        const res = await fetch("/api/files");
        const files = await res.json();
        files.forEach(f => {
            const div = document.createElement("div");
            div.textContent = f.name;
            div.classList.add("file-row");
            filesDiv.appendChild(div);
        });
    } catch(err) { console.error(err); }
}

async function loadFilesTable() {
    const tbody = document.querySelector("#fileTable tbody");
    tbody.innerHTML = "";
    try {
        const res = await fetch("/api/files");
        const files = await res.json();
        files.forEach(f => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${f.id}</td>
                <td>${f.name}</td>
                <td>
                    <button onclick="editFile(${f.id}, '${f.name}')">Edit</button>
                    <button onclick="deleteFile(${f.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(err) { console.error(err); }
}

function editFile(id, currentName) {
    const newName = prompt("Edit file name:", currentName);
    if (!newName) return;
    fetch(`/api/files/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
    }).then(() => {
        loadFilesTable();
        loadFilesList();
    });
}

function deleteFile(id) {
    if (!confirm("Are you sure you want to delete this file?")) return;
    fetch(`/api/files/${id}`, { method: "DELETE" })
        .then(() => {
            loadFilesTable();
            loadFilesList();
        });
}

// Filter files list in right panel
function filterFiles() {
    const filter = document.getElementById("searchFiles").value.toLowerCase();
    const files = document.querySelectorAll("#filesList .file-row");
    files.forEach(f => {
        f.style.display = f.textContent.toLowerCase().includes(filter) ? "" : "none";
    });
}

// Filter files table in popup
function filterFileTable() {
    const filter = document.getElementById("fileSearch").value.toLowerCase();
    const rows = document.querySelectorAll("#fileTable tbody tr");
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

// ----------------------
// Initial Load
// ----------------------
loadMembers();
loadFilesList();



