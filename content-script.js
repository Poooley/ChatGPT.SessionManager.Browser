(async () => {
  const { SessionManagerWebSocket } = await import(chrome.runtime.getURL('SessionManagerWebSocket.js'));
  const { SessionManagerApi } = await import(chrome.runtime.getURL('SessionManagerApi.js'));

  sessionManagerApi = new SessionManagerApi();
  let apiKey;
  while (true) {
    chrome.storage.local.get('apiKey', function(result) {
      apiKey = result.apiKey;
    });
    if(apiKey){
      break;
    }
    console.log('Waiting for API key...');

    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  while (true) {
    try {
      let token = await sessionManagerApi.generateToken();

      if (token) {
        console.log(`Got token`)
        break;
      }
    }
    catch (err) {
      console.error("Got error while generating token, trying again later.");

      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }
  
  let sessionManagerWebSocket = new SessionManagerWebSocket(token);
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;
})();

function checkLockStatus(isLocked) {
  const buttons = document.querySelectorAll('button.absolute, button.btn');
  buttons.forEach(button => {
    button.disabled = isLocked;
  });
}