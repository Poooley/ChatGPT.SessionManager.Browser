const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("add-btn");
const removeBtn = document.getElementById("remove-btn");
const currentName = document.getElementById("current-name").querySelector("span");

let storedName = localStorage.getItem("name") || "";
let sessionId = localStorage.getItem("sessionId") || generateSessionId();

if (!localStorage.getItem("sessionId")) {
  localStorage.setItem("sessionId", sessionId);
  console.warn("No session ID found, generating a new one: " + sessionId);
}

refresh();

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

function fetchRegisteredUsers() {
  // Replace with your internal API URL
  const apiUrl = "https://your-internal-api-url.com/api/endpoint";

  fetch(apiUrl)
    .then((response) => response.json())
    .then((users) => {
      const userList = document.getElementById("users");
      userList.innerHTML = "";

      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user.name + " (" + user.sessionId + ")";
        userList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching registered users:", error);
    });
}

// fetchRegisteredUsers();