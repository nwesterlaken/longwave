import GameDatabase from './database.js';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // In-memory cache: roomId -> room state
    this.db = new GameDatabase();
    
    // Initialize asynchronously
    this.ready = this.initialize();
    
    // Setup periodic cleanup
    setInterval(() => this.cleanupInactiveRooms(), 60 * 60 * 1000); // Every hour
  }

  async initialize() {
    // Wait for database to be ready
    await this.db.ready;
    
    // Load active rooms from database on startup
    await this.loadActiveRooms();
  }

  async loadActiveRooms() {
    const activeRooms = await this.db.getActiveRooms();
    for (const room of activeRooms) {
      const state = await this.db.getGameState(room.room_id);
      if (state) {
        this.rooms.set(room.room_id, {
          ...state,
          roomId: room.room_id,
          mode: room.mode,
          players: new Map(Object.entries(state.players || {})),
          sockets: new Map() // Will be populated as players reconnect
        });
      }
    }
    console.log(`Loaded ${activeRooms.length} active rooms from database`);
  }

  async createRoom(roomId, mode = 'classic') {
    if (this.rooms.has(roomId)) {
      return { success: false, error: 'Room already exists' };
    }

    const result = await this.db.createRoom(roomId, mode);
    if (!result.success) {
      return result;
    }

    const room = {
      roomId,
      mode,
      players: new Map(),
      sockets: new Map(),
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    await this.db.logEvent(roomId, 'room_created', { mode });
    
    return { success: true, room };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  async addPlayerToRoom(roomId, playerId, playerName, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const playerData = {
      id: playerId,
      name: playerName,
      socketId,
      joinedAt: Date.now(),
      isConnected: true
    };

    room.players.set(playerId, playerData);
    room.sockets.set(socketId, playerId);
    
    await this.db.logEvent(roomId, 'player_joined', { playerId, playerName });
    
    return { success: true, player: playerData };
  }

  async removePlayerFromRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerId = room.sockets.get(socketId);
    if (playerId) {
      const player = room.players.get(playerId);
      if (player) {
        player.isConnected = false;
        await this.db.logEvent(roomId, 'player_disconnected', { playerId });
      }
      room.sockets.delete(socketId);
    }

    // If no connected players, mark room as inactive after timeout
    const hasConnectedPlayers = Array.from(room.players.values())
      .some(p => p.isConnected);
    
    if (!hasConnectedPlayers) {
      setTimeout(async () => {
        const currentRoom = this.rooms.get(roomId);
        if (currentRoom) {
          const stillHasPlayers = Array.from(currentRoom.players.values())
            .some(p => p.isConnected);
          if (!stillHasPlayers) {
            await this.db.markRoomInactive(roomId);
          }
        }
      }, 5 * 60 * 1000); // 5 minutes grace period
    }
  }

  async updateGameState(roomId, stateUpdate) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Merge state update
    Object.assign(room, stateUpdate);
    
    // Persist to database
    const stateToSave = this.serializeRoomState(room);
    await this.db.saveGameState(roomId, stateToSave);
    
    return { success: true, state: room };
  }

  serializeRoomState(room) {
    // Convert Maps to objects for JSON serialization
    return {
      ...room,
      players: Object.fromEntries(room.players),
      sockets: undefined // Don't persist socket connections
    };
  }

  getPlayersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room.players.values());
  }

  getConnectedPlayersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room.players.values()).filter(p => p.isConnected);
  }

  broadcastToRoom(io, roomId, event, data) {
    io.to(roomId).emit(event, data);
  }

  async cleanupInactiveRooms() {
    const deleted = await this.db.cleanupInactiveRooms();
    console.log(`Cleaned up ${deleted} inactive rooms`);
    
    // Also remove from memory
    for (const [roomId, room] of this.rooms.entries()) {
      const hasConnectedPlayers = Array.from(room.players.values())
        .some(p => p.isConnected);
      
      const lastActivity = room.lastActivity || room.createdAt;
      const isOld = Date.now() - lastActivity > 24 * 60 * 60 * 1000;
      
      if (!hasConnectedPlayers && isOld) {
        this.rooms.delete(roomId);
      }
    }
  }

  async close() {
    await this.db.close();
  }
}

export default RoomManager;
