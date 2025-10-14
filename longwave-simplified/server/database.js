import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GameDatabase {
  constructor(dbPath = join(__dirname, 'longwave.db')) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('Connected to SQLite database');
    });
    this.ready = this.initTables();
  }

  // Promisify database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async initTables() {
    // Enable foreign keys
    await this.run('PRAGMA foreign_keys = ON');

    // Rooms table - stores room metadata and settings
    await this.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        room_id TEXT PRIMARY KEY,
        mode TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_activity INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Game state table - stores current game state as JSON
    await this.run(`
      CREATE TABLE IF NOT EXISTS game_states (
        room_id TEXT PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      )
    `);

    // Session history for analytics/debugging
    await this.run(`
      CREATE TABLE IF NOT EXISTS session_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_rooms_active 
      ON rooms(is_active, last_activity)
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_history_room 
      ON session_history(room_id, timestamp)
    `);
  }

  // Create a new room
  async createRoom(roomId, mode) {
    const now = Date.now();
    try {
      await this.run(
        'INSERT INTO rooms (room_id, mode, created_at, last_activity) VALUES (?, ?, ?, ?)',
        [roomId, mode, now, now]
      );
      return { success: true, roomId };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return { success: false, error: 'Room already exists' };
      }
      throw error;
    }
  }

  // Get room info
  async getRoom(roomId) {
    return await this.get('SELECT * FROM rooms WHERE room_id = ?', [roomId]);
  }

  // Update room activity timestamp
  async updateRoomActivity(roomId) {
    await this.run(
      'UPDATE rooms SET last_activity = ? WHERE room_id = ?',
      [Date.now(), roomId]
    );
  }

  // Save game state
  async saveGameState(roomId, state) {
    await this.run(
      'INSERT OR REPLACE INTO game_states (room_id, state_json, updated_at) VALUES (?, ?, ?)',
      [roomId, JSON.stringify(state), Date.now()]
    );
    await this.updateRoomActivity(roomId);
  }

  // Get game state
  async getGameState(roomId) {
    const result = await this.get(
      'SELECT state_json FROM game_states WHERE room_id = ?',
      [roomId]
    );
    return result ? JSON.parse(result.state_json) : null;
  }

  // Log session event
  async logEvent(roomId, eventType, eventData = null) {
    const dataJson = eventData ? JSON.stringify(eventData) : null;
    await this.run(
      'INSERT INTO session_history (room_id, event_type, event_data, timestamp) VALUES (?, ?, ?, ?)',
      [roomId, eventType, dataJson, Date.now()]
    );
  }

  // Clean up inactive rooms (older than 24 hours)
  async cleanupInactiveRooms(maxAgeMs = 24 * 60 * 60 * 1000) {
    const cutoffTime = Date.now() - maxAgeMs;
    const result = await this.run(
      'DELETE FROM rooms WHERE last_activity < ? AND is_active = 0',
      [cutoffTime]
    );
    return result.changes;
  }

  // Mark room as inactive (but don't delete yet)
  async markRoomInactive(roomId) {
    await this.run('UPDATE rooms SET is_active = 0 WHERE room_id = ?', [roomId]);
  }

  // Get all active rooms
  async getActiveRooms() {
    return await this.all('SELECT * FROM rooms WHERE is_active = 1');
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default GameDatabase;
