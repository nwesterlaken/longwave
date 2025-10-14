import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(serverUrl = 'http://localhost:3001') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Setup reconnection listeners
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.emit('socket:disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('socket:error', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Register with socket if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unregister event listener
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event to all local listeners
  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Send event to server
  send(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send:', event);
    }
  }

  // Promise-based emit with acknowledgement
  async sendWithAck(event, data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error('Socket timeout'));
      }, timeout);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;
