import { UserEntity } from './UserEntity.js';
import { SessionManager } from './SessionManagerApi.js';

const apiKeyInput = document.getElementById("api-key-input");
const apiKeySubmit = document.getElementById("api-key-submit");
const content = document.getElementById("content");

apiKeySubmit.addEventListener("click", () => {
  let apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    // Set API key to session storage
    window.localStorage.setItem("apiKey", apiKey);
    content.style.display = "block";
    initApp();
  }
});

function initApp() {
  const nameInput = document.getElementById("name-input");
  const addBtn = document.getElementById("add-btn");
  const removeBtn = document.getElementById("remove-btn");
  const currentName = document.getElementById("current-name").querySelector("span");
  const userList = document.getElementById("user-list");

  const sessionManager = new SessionManager();

  let storedName = window.localStorage.getItem("name") || "";
  let sessionId = window.localStorage.getItem("sessionId") || generateSessionId();

  if (!localStorage.getItem("sessionId")) {
    console.warn("No session ID found, generating a new one: " + sessionId);
    window.localStorage.setItem("sessionId", sessionId);
    sessionManager.addUser(new UserEntity(sessionId, null, false));
    console.log("User instance created with session ID: " + sessionId);
  }

  refresh(); 
  showUsers();
  setInterval(showUsers, 2000);

  // add button
  addBtn.addEventListener("click", () => {
    let inpName = nameInput.value.trim();
    if (inpName) {
      setNameAndRefresh(inpName);
      sessionManager.updateUser(new UserEntity(sessionId, inpName, false));
    }
  });

  // remove button
  removeBtn.addEventListener("click", () => {
    if (sessionId && storedName) {
      storedName = "";
      localStorage.removeItem("name");
      refresh();
      sessionManager.deleteUserById(sessionId);
    }
  });

  function setNameAndRefresh(name) {
    storedName = name;
    window.localStorage.setItem("name", name);
    refresh();
  }

  function refresh() {
    currentName.textContent = storedName + " (" + sessionId + ")";
  }

// Helper function to compare two user arrays
function usersEqual(users1, users2) {
  if (users1.length !== users2.length) {
    return false;
  }

  for (let i = 0; i < users1.length; i++) {
    if (users1[i].sessionId !== users2[i].sessionId || users1[i].Name !== users2[i].Name) {
      return false;
    }
  }

  return true;
}

async function showUsers() {
  const newUsers = await sessionManager.getUsers();
  const currentUsers = Array.from(userList.children).map(li => ({
    sessionId: li.getAttribute('data-session-id'),
    Name: li.getAttribute('data-name')
  }));

  if (!usersEqual(newUsers, currentUsers)) {
    userList.innerHTML = "";
    newUsers.forEach((user) => {
      if (user.sessionId !== sessionId) {
        const li = document.createElement("li");
        li.setAttribute('data-session-id', user.sessionId);
        li.setAttribute('data-name', user.Name);
        li.textContent = user.Name + " (" + user.Id + ")" + (user.IsLocked ? " (locks GPT)" : "");
        userList.appendChild(li);
      }
    });
  }
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
}

if (window.localStorage.getItem("apiKey")) {
  content.style.display = "block";
  initApp();
}