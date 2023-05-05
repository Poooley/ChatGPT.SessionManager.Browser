import { UserEntity } from './UserEntity.js';
import { SessionManager } from './SessionManagerApi.js';
import { SessionManagerWebSocket } from './SessionManagerWebSocket.js';

const apiKeyInput = document.getElementById("api-key-input");
const apiKeySubmit = document.getElementById("api-key-submit");
const content = document.getElementById("content");

apiKeySubmit.addEventListener("click", async () => {
  let apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    // Set API key to session storage
    await browser.storage.local.set({ apiKey: apiKey });
    content.style.display = "block";
    await initApp();
  }
});

let users = [];

async function initApp() {
  const nameInput = document.getElementById("name-input");
  const addBtn = document.getElementById("add-btn");
  const removeBtn = document.getElementById("remove-btn");
  const currentName = document.getElementById("current-name").querySelector("span");
  const userList = document.getElementById("user-list");

  const sessionManager = new SessionManager();
  const sessionManagerWebSocket = new SessionManagerWebSocket();
  let storedName = window.localStorage.getItem("name") || "";
  let sessionId = window.localStorage.getItem("sessionId") || generateSessionId();

  nameInput.value = storedName;

  try {
    users = await sessionManager.getUsers();

    console.log(users);

    showUsers();
  } catch (err) {
    console.error(err);
  }

  if (!localStorage.getItem("sessionId")) {
    console.warn("No session ID found, generating a new one: " + sessionId);
    window.localStorage.setItem("sessionId", sessionId);
    sessionManager.addUser(new UserEntity(sessionId, null, false));
    console.log("User instance created with session ID: " + sessionId);
  }

  refresh(); 
  sessionManagerWebSocket.onUserChanged = showUsers;

  // add button
  addBtn.addEventListener("click", async () => {
    let inpName = nameInput.value.trim();
    if (inpName) {
      setNameAndRefresh(inpName);
      await sessionManager.updateUser(new UserEntity(sessionId, inpName, false));
    }
  });

  // remove button
  removeBtn.addEventListener("click", async () => {
    if (sessionId) {
      await sessionManager.updateUser(new UserEntity(sessionId, null, false));
      setNameAndRefresh("");
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

async function showUsers(user, action) {
  try {
    if (action === 1) {
      users.push(user);
    } else if (action === 2) {
      const index = users.findIndex(u => u.Id === user.Id);
      if (index !== -1) {
        users[index] = user;
      }
    } else if (action === 3) {
      users = users.filter(u => u.Id !== user.Id);
    }

    userList.innerHTML = '';
    users.forEach((user) => {
      console.log(`Show user ${user.Name}, ${user.Id}, ${user.IsLocked}`);      if (user.sessionId !== sessionId) {
        const li = document.createElement('li');
        li.setAttribute('data-session-id', user.Id);
        li.setAttribute('data-name', user.Name);
        li.textContent = user.Name + ' (' + user.Id + ')' + (user.IsLocked ? ' (locks GPT)' : '');
        userList.appendChild(li);
      }
    });
  } catch (err) {
    console.error(err);
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


(async () => {
  const storedData = await browser.storage.local.get('apiKey');
  if (storedData.apiKey) {
    content.style.display = "block";
    await initApp();
  }
})();