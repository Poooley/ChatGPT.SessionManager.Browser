import { UserEntity } from './UserEntity.js';
import { SessionManagerApi } from './SessionManagerApi.js';
import { SessionManagerWebSocket } from './SessionManagerWebSocket.js';

const apiKeyInput = document.getElementById("api-key-input");
const apiKeySubmit = document.getElementById("api-key-submit");
const content = document.getElementById("content");
const apiKeyContainer = document.getElementById("api-key-container");

apiKeySubmit.addEventListener("click", () => {
  let apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    // Set API key to session storage
    chrome.storage.local.set({ apiKey: apiKey }, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      initApp();
    })
  }
});

let users = [];

async function initApp() {
  const nameInput = document.getElementById("name-input");
  const addBtn = document.getElementById("add-btn");
  const removeBtn = document.getElementById("remove-btn");
  const currentName = document.getElementById("current-name").querySelector("span");
  const userList = document.getElementById("user-list");

  let storedName = window.localStorage.getItem("name") || "";
  let sessionId = window.localStorage.getItem("sessionId") || "";

  const sessionManager = new SessionManagerApi();
  const sessionManagerWebSocket = new SessionManagerWebSocket(false);

  // check if session ID is already set

  if (!window.localStorage.getItem("sessionId")) {

    sessionId = generateSessionId();

    try {
      // try to add user      
      await sessionManager.addUser(new UserEntity(sessionId, null, false));

      // set session ID to session storage
      console.warn("User instance created with session ID: " + sessionId);
      window.localStorage.setItem("sessionId", sessionId);
      chrome.storage.local.set({ sessionId: sessionId }, async function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
      });
    }
    catch (err) {
      showErrorMessage("Got error while adding user, please check your API key.");
      return;
    }

    console.log("User instance created with session ID: " + sessionId);
  }

  // CONNECT TO WEBSOCKET
  try {
    await sessionManagerWebSocket.connectWebSocket(sessionId);
  }
  catch (err) {
    console.debug("Got error while connecting to WebSocket.");
    return;
  }

  // SHOW ALL USERS
  try {
    users = await sessionManager.getUsers();

    console.log(`Got ${users.length} users.`);

    showUsers();
  } catch (err) {
    console.error("Error while getting and showing users.");
    return;
  }

  // MAKE THE API CONTAINER INVISIBLE AND SHOW THE CONTENT
  apiKeyContainer.style.display = "none";
  content.style.display = "block";

  refresh();
  sessionManagerWebSocket.onUserChanged = showUsers;

  // add button
  addBtn.addEventListener("click", async () => {
    let inpName = nameInput.value.trim();
    if (inpName) {
      setNameAndRefresh(inpName);

      try {
        await sessionManager.updateUser(new UserEntity(sessionId, inpName, false));
      }
      catch (err) {
        err.text().then(errorMessage => {
          console.error(errorMessage);

          // if check when user is not found

          if (err.status === 404) {
            console.log("User not found, creating a new one: " + sessionId);
            sessionManager.addUser(new UserEntity(sessionId, inpName, false));
          }
        });
      }
    }
  });

  // remove button
  removeBtn.addEventListener("click", async () => {
    if (sessionId) {
      try {
        await sessionManager.updateUser(new UserEntity(sessionId, null, false));
      }
      catch (err) {
        err.text().then(errorMessage => {
          console.error(errorMessage);
        });
      }

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

    if (storedName) {
      nameInput.value = storedName;
      removeBtn.disabled = false;

      addBtn.textContent = "Update Name";
    }
    else {
      nameInput.value = "";
      removeBtn.disabled = true;

      addBtn.textContent = "Add Name";
    }
  }

  async function showUsers(user, action) {
    console.log(`Show users ${user}, ${action}`);

    try {
      if (action === 1) {
        users.push(user);
      }
      else if (action === 2) {
        const index = users.findIndex(u => u.Id === user.Id);
        if (index !== -1) {
          users[index] = user;
        }
        else {
          users.push(user);
        }
      }
      else if (action === 3) {
        users = users.filter(u => u.Id !== user.Id);
      }

      userList.innerHTML = '';
      users.forEach((user) => {
        console.log(`Show user ${user.Name}, ${user.Id}, ${user.IsLocked}`); if (user.sessionId !== sessionId) {
          const li = document.createElement('li');
          li.setAttribute('data-session-id', user.Id);
          li.setAttribute('data-name', user.Name);
          li.textContent = user.Name + ' (' + user.Id + ')' + (user.IsLocked ? ' - locks GPT' : '');
          userList.appendChild(li);

          if (user.IsLocked) {
            li.classList.add("locked");
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  /*
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('click', () => {
    console.log('Toggle dark mode');
    document.body.classList.toggle('dark-mode');
  });
  */

  function showErrorMessage(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";

    apiKeyInput.classList.add("error");
    setTimeout(() => apiKeyInput.classList.remove("error"), 500);

    apiKeyInput.focus();

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
  chrome.storage.local.get('apiKey', async function (result) {
    const apiKey = result.apiKey;
    apiKeyContainer.style.display = "block";
    if (apiKey) {
      await initApp();
    }
  });
})();