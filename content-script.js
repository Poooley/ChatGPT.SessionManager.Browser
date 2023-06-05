(async () => {
  const { SessionManagerWebSocket } = await import(chrome.runtime.getURL('SessionManagerWebSocket.js'));

  let apiKey;
  let sessionId;

  while (true) {
    chrome.storage.local.get('apiKey', function (result) {
      apiKey = result.apiKey;
    });

    chrome.storage.local.get('sessionId', function (result) {
      sessionId = result.sessionId;
    });

    if (apiKey && sessionId) {
      break;
    }
    console.log('Waiting for API key...');

    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  let promptTextarea = null;
  let promptDiv = null;

  while (!promptTextarea || !promptDiv) {
    promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      promptDiv = promptTextarea.parentNode;
    }

    if (!promptTextarea || !promptDiv) {
      console.log("Waiting for the page to load...");
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.debug('Found prompt textarea:', promptTextarea);
  const buttons = promptDiv.querySelectorAll('button');

  promptTextarea.addEventListener('input', () => {
    buttons.forEach(button => {
      setTimeout(() => {

        if (button.disabled !== this.isLockedState) {
          button.disabled = this.isLockedState;
          console.debug('Delayed check: Setting button disabled to', this.isLockedState);
        }
      }, 1000);

      console.debug('Typing detected: Setting button disabled to', this.isLockedState);
      button.disabled = this.isLockedState;
    });
  });

  let sessionManagerWebSocket = new SessionManagerWebSocket();
  sessionManagerWebSocket.connectWebSocket(sessionId);
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;

})();

window.isLockedState = false;

function checkLockStatus(isLocked) {
  window.isLockedState = isLocked;

  console.info(`Lock status changed to ${window.isLockedState}`);
  const promptDiv = document.getElementById('prompt-textarea').parentNode;
  const buttons = promptDiv.querySelectorAll('button');

  buttons.forEach(button => {
    button.disabled = isLockedState;
  });
}