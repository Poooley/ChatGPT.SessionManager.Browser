import { SessionManagerApi } from './SessionManagerApi.js';


export class SessionManagerWebSocket {
  constructor(retry = true) {
    this.onLockStatusChanged = null;
    this.onUserChanged = null;
    this._ws = null;
    this._retry = retry;
  }

  async connectWebSocket(id) {
    var token = await this.getToken(id);

    this._ws = new WebSocket(`wss://k8s.haidinger.me/api/session-manager/ws?token=${token}`);

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
      setTimeout(() => this.connectWebSocket(id), 5000);
    });

    this._ws.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);

      setTimeout(() => this.connectWebSocket(id), 5000);
    });
  }

  async getToken(id) {
    var sessionManagerApi = new SessionManagerApi();
    let token;
    do {
      try {
        while (!sessionManagerApi) {
          // Wait until sessionManagerApi is defined
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        token = await sessionManagerApi.generateToken(id);
        if (token) {
          console.log(`Got token`);
          break;
        }
      }
      catch (err) {
        console.warn("Got error while generating token, try again later (retry = " + this._retry + "): ");
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    } while (this._retry);

    if (!token) {
      throw new Error("Could not get token");
    }
    return token;
  }
}