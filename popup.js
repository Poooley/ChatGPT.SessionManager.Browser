const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("add-btn");
const removeBtn = document.getElementById("remove-btn");
const currentName = document.getElementById("current-name").querySelector("span");

let storedName = localStorage.getItem("name") || "";
let sessionId = localStorage.getItem("sessionId") || generateSessionId();

if (!storedName) {
  localStorage.setItem("name", sessionId);
}

if (!localStorage.getItem("sessionId")) {
  localStorage.setItem("sessionId", sessionId);
}

refresh();

// add button
addBtn.addEventListener("click", () => {
  let inpName = nameInput.value.trim();
  if (inpName) {
    setNameAndUpdate(inpName);
  }
});

// remove button
removeBtn.addEventListener("click", () => {
  if (sessionId) {
    storedName = "";
    localStorage.removeItem("name");
    refresh();
  }
});

function setNameAndUpdate(name) {
  storedName = name;
  localStorage.setItem("name", name);
  refresh();
}

function setSessionAndUpdate(session) {
  sessionId = session;
  localStorage.setItem("sessionId", session);
  refresh();
}

function refresh() {
  currentName.textContent = storedName + " (" + sessionId + ")";
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
