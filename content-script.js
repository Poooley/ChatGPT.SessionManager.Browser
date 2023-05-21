let sessionManagerApi;

(async () => {
  const { SessionManagerWebSocket } = await import(browser.runtime.getURL('SessionManagerWebSocket.js'));
  const { SessionManagerApi } = await import(browser.runtime.getURL('SessionManagerApi.js'));

  sessionManagerApi = new SessionManagerApi();

  while (!(await browser.storage.local.get('apiKey')).apiKey) {
    console.log('Waiting for API key...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  let token = await sessionManagerApi.generateToken();
  let sessionManagerWebSocket = new SessionManagerWebSocket(token);
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;
})();

function checkLockStatus(isLocked) {
  const buttons = document.querySelectorAll('button.absolute, button.btn');
  buttons.forEach(button => {
    button.disabled = isLocked;
  });
}
