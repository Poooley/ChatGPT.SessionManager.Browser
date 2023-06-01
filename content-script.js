(async () => {
  const { SessionManagerWebSocket } = await import(chrome.runtime.getURL('SessionManagerWebSocket.js'));
  const { SessionManagerApi } = await import(chrome.runtime.getURL('SessionManagerApi.js'));

  sessionManagerApi = new SessionManagerApi();
  let apiKey;
  let sessionId;

  while (true) {
    chrome.storage.local.get('apiKey', function (result) {
      apiKey = result.apiKey;
    });

    chrome.storage.local.get('sessionId', function (result) {
      sessionId = result.sessionId; 6
    });

    if (apiKey && sessionId) {
      break;
    }
    console.log('Waiting for API key...');

    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  let sessionManagerWebSocket = new SessionManagerWebSocket();
  sessionManagerWebSocket.connectWebSocket(sessionId);
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;
})();

function checkLockStatus(isLocked) {
  console.info(`Lock status changed to ${isLocked}`);
  const buttons = document.querySelectorAll('button.absolute, button.btn');
  buttons.forEach(button => {
    button.disabled = isLocked;
  });
}