let sessionManager;

(async () => {
  const { SessionManager } = await import(browser.runtime.getURL('SessionManagerApi.js'));
  sessionManager = new SessionManager();
})();


async function checkLockStatus() {
  const { apiKey } = await browser.storage.local.get('apiKey');
  
  if (apiKey == null) 
    return;
      
  try {
    const isLocked = await sessionManager.isLocked();
    
    const buttons = document.querySelectorAll('button.btn, button.btn-primary button.absolute');
    buttons.forEach(button => {
      button.disabled = isLocked;
    });
  } catch (error) {
    console.error('Error checking lock status:', error);
  }
}

setInterval(checkLockStatus, 2000);
