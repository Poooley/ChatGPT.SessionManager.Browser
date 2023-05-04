let sessionManagerWebSocket;

(async () => {
  const { SessionManagerWebSocket } = await import(browser.runtime.getURL('SessionManagerWebSocket.js'));
    sessionManagerWebSocket = new SessionManagerWebSocket();
  sessionManagerWebSocket.onLockStatusChanged = checkLockStatus;
})();

function checkLockStatus(isLocked) {
  const buttons = document.querySelectorAll('button.absolute, button.btn');
  buttons.forEach(button => {
    button.disabled = isLocked;
  });
}