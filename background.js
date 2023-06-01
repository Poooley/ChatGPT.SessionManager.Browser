(async () => {
  const { SessionManagerApi } = await import('./SessionManagerApi.js');

const sessionManagerApi = new SessionManagerApi();

chrome.webRequest.onHeadersReceived.addListener(
  async function (details) {
    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (details.responseHeaders[i].name.toLowerCase() === 'content-type') {
        if (details.responseHeaders[i].value === 'text/event-stream; charset=utf-8') {
          console.log('Event-stream detected:', details.url);
          console.log('Request to /conversation started:', details.url);
          // Make request to another API here
          try {
            await sessionManagerApi.lockUser(window.localStorage.getItem("sessionId"));
          }
          catch (err) {
            console.error(err);
          }
        }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"] 
);

chrome.webRequest.onCompleted.addListener(
  async function (details) {
    if (details.url === 'https://chat.openai.com/backend-api/conversation') {
      console.log('Request to /conversation finished:', details.url);
      try {
        await sessionManagerApi.unlockUser(window.localStorage.getItem("sessionId"));
      }
      catch (err) {
        console.error(err);
      }    
    }
  },
  { urls: ["<all_urls>"] }
)})();