const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("add-btn");
const removeBtn = document.getElementById("remove-btn");
const currentName = document.getElementById("current-name").querySelector("span");

let storedName = localStorage.getItem("name") || "";
let sessionId = storedName || generateSessionId();

if (!storedName) {
  localStorage.setItem("name", sessionId);
}

updateCurrentName(sessionId);

addBtn.addEventListener("click", () => {
  let inpName = nameInput.value.trim();
  if (inpName) {
    sessionId = inpName;
    localStorage.setItem("name", inpName);
    updateCurrentName(sessionId);
    nameInput.value = "";
  }
});

removeBtn.addEventListener("click", () => {
  if (sessionId) {
    localStorage.removeItem("name");
    sessionId = generateSessionId();
    localStorage.setItem("name", sessionId);
    updateCurrentName(sessionId);
  }
});

function updateCurrentName(name) {
  currentName.textContent = name;
}

// Generate a random session ID
function generateSessionId() {
  let length = 8;
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
