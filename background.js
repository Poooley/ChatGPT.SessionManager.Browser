
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (details.responseHeaders[i].name.toLowerCase() === 'content-type') {
        if (details.responseHeaders[i].value === 'text/event-stream; charset=utf-8') {
          console.log('Event-stream detected:', details.url);
          console.log('Request to /conversation started:', details.url);

        }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);
/*
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url === 'https://chat.openai.com/backend-api/conversation') {
      console.log('Request to /conversation started:', details.url);
      // Make request to API here
    }
  },
  { urls: ["<all_urls>"] }
);
*/
chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.url === 'https://chat.openai.com/backend-api/conversation') {
      console.log('Request to /conversation finished:', details.url);
      // Make request to another API here
    }
  },
  { urls: ["<all_urls>"] }
);
