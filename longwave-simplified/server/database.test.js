import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { unlink } from 'node:fs/promises';
import GameDatabase from './database.js';

const TEST_DB_PATH = './test-longwave.db';

describe('GameDatabase', () => {
  let db;

  before(async () => {
    db = new GameDatabase(TEST_DB_PATH);
    await db.ready; // Wait for tables to be created
  });

  after(async () => {
    await db.close();
    try {
      await unlink(TEST_DB_PATH);
    } catch (err) {
      // File might not exist, that's ok
    }
  });

  test('should create tables on initialization', async () => {
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('rooms', 'game_states', 'session_history')
    `);
    
    assert.strictEqual(tables.length, 3, 'Should have 3 tables');
  });

  test('should create a new room', async () => {
    const result = await db.createRoom('TEST001', 'classic');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.roomId, 'TEST001');
  });

  test('should not create duplicate room', async () => {
    await db.createRoom('TEST002', 'classic');
    const result = await db.createRoom('TEST002', 'classic');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Room already exists');
  });

  test('should get room info', async () => {
    await db.createRoom('TEST003', 'pulsecheck');
    const room = await db.getRoom('TEST003');
    assert.strictEqual(room.room_id, 'TEST003');
    assert.strictEqual(room.mode, 'pulsecheck');
    assert.strictEqual(room.is_active, 1);
  });

  test('should save and retrieve game state', async () => {
    await db.createRoom('TEST004', 'classic');
    const state = {
      players: { player1: { name: 'Alice', team: 'left' } },
      score: { left: 5, right: 3 },
      currentRound: 2
    };
    
    await db.saveGameState('TEST004', state);
    const retrieved = await db.getGameState('TEST004');
    
    assert.deepStrictEqual(retrieved, state);
  });

  test('should update room activity timestamp', async () => {
    await db.createRoom('TEST005', 'classic');
    const before = await db.getRoom('TEST005');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.updateRoomActivity('TEST005');
    const after = await db.getRoom('TEST005');
    assert.ok(after.last_activity > before.last_activity);
  });

  test('should log session events', async () => {
    await db.createRoom('TEST006', 'classic');
    await db.logEvent('TEST006', 'player_joined', { playerId: 'p1', playerName: 'Bob' });
    
    const events = await db.all(
      'SELECT * FROM session_history WHERE room_id = ?',
      ['TEST006']
    );
    
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].event_type, 'player_joined');
    
    const eventData = JSON.parse(events[0].event_data);
    assert.strictEqual(eventData.playerId, 'p1');
  });

  test('should mark room as inactive', async () => {
    await db.createRoom('TEST007', 'classic');
    await db.markRoomInactive('TEST007');
    
    const room = await db.getRoom('TEST007');
    assert.strictEqual(room.is_active, 0);
  });

  test('should get all active rooms', async () => {
    await db.createRoom('TEST008', 'classic');
    await db.createRoom('TEST009', 'pulsecheck');
    await db.markRoomInactive('TEST009');
    
    const activeRooms = await db.getActiveRooms();
    const testRooms = activeRooms.filter(r => r.room_id.startsWith('TEST'));
    
    assert.ok(testRooms.length > 0);
    assert.ok(testRooms.every(r => r.is_active === 1));
  });

  test('should cleanup inactive rooms', async () => {
    // Create an old inactive room
    await db.createRoom('TEST010', 'classic');
    await db.markRoomInactive('TEST010');
    
    // Manually set old timestamp
    await db.run(
      'UPDATE rooms SET last_activity = ? WHERE room_id = ?',
      [Date.now() - 25 * 60 * 60 * 1000, 'TEST010'] // 25 hours ago
    );
    
    const deleted = await db.cleanupInactiveRooms();
    assert.ok(deleted > 0, 'Should delete at least one room');
    
    const room = await db.getRoom('TEST010');
    assert.strictEqual(room, undefined, 'Old inactive room should be deleted');
  });
});
