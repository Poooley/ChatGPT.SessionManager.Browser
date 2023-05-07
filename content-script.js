let sessionManagerWebSocket;

(async () => {
  const { SessionManagerWebSocket } = await import(browser.runtime.getURL('SessionManagerWebSocket.js'));
  const { SessionManagerApi } = await import(browser.runtime.getURL('SessionManagerApi.js'));

  const sessionManagerApi = new SessionManagerApi();

  while (!(await browser.storage.local.get('apiKey')).apiKey) {
    console.log('Waiting for API key...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  let token = await sessionManagerApi.generateToken();
  sessionManagerWebSocket = new SessionManagerWebSocket(token);
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;
})();

function checkLockStatus(isLocked) {
  const buttons = document.querySelectorAll('button.absolute, button.btn');
  buttons.forEach(button => {
    button.disabled = isLocked;
  });
}
