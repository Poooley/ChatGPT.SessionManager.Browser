export class SessionManagerWebSocket {
    constructor() {
      this.onLockStatusChanged = null;
      this.onUserChanged = null;
      this._ws = null;
      this.connectWebSocket();
    }
  
    connectWebSocket() {
        this._ws = new WebSocket('ws://localhost:5064/api/session-manager/ws');
    
        this._ws.addEventListener('open', (event) => {
          console.log('WebSocket connection opened:', event);
        });
    
        this._ws.addEventListener('message', (event) => {
          console.log('WebSocket message received:', event.data);
    
        const data = JSON.parse(event.data);

        if (data.type === 'lockStatusChanged' && this.onLockStatusChanged) {
          this.onLockStatusChanged(data.lockStatus);
        }
        else if (data.type === "userChanged" && this.onUserChanged) {
          this.onUserChanged(data.user, data.action);
        }
      });
  
      this._ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event);
        // Attempt to reconnect after a delay
        setTimeout(() => this.connectWebSocket(), 5000);
      });
  
      this._ws.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
      });
    }
  }