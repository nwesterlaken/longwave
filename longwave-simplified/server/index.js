import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import RoomManager from './roomManager.js';
import ClassicModeLogic from './modes/classicMode.js';
import { getCardByIndex, getCardsByTheme, getCardByIndexFromTheme } from './spectrumCards.js';
import { RoundPhase } from '../shared/gameTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const roomManager = new RoomManager();

// Wait for roomManager to initialize
roomManager.ready.then(() => {
  console.log('RoomManager initialized and ready');
}).catch(err => {
  console.error('Failed to initialize RoomManager:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  console.log(`Serving static files from: ${clientBuildPath}`);
  app.use(express.static(clientBuildPath));
}

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  // Return serialized version without socket info
  res.json({
    roomId: room.roomId,
    mode: room.mode,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isConnected: p.isConnected
    })),
    createdAt: room.createdAt
  });
});

// In production, serve index.html for all other routes (SPA support)
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create or join room
  socket.on('room:create', async ({ roomId, mode, playerId, playerName }) => {
    console.log(`Creating room ${roomId} with mode ${mode}`);
    
    let room = roomManager.getRoom(roomId);
    
    if (!room) {
      const result = await roomManager.createRoom(roomId, mode);
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }
      room = result.room;
    }
    
    // Add player to room
    const playerResult = await roomManager.addPlayerToRoom(roomId, playerId, playerName, socket.id);
    if (!playerResult.success) {
      socket.emit('error', { message: playerResult.error });
      return;
    }
    
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = playerId;
    
    // Send room state to the joining player
    socket.emit('room:joined', {
      roomId,
      mode: room.mode,
      playerId
    });
    
    // Notify other players
    socket.to(roomId).emit('room:player_joined', {
      player: playerResult.player
    });
    
    // Send current players list
    const players = roomManager.getPlayersInRoom(roomId);
    socket.emit('room:players', { players });
  });

  // Join existing room
  socket.on('room:join', async ({ roomId, playerId, playerName }) => {
    console.log(`Player ${playerName} joining room ${roomId}`);
    
    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Check if player is reconnecting
    const existingPlayer = room.players.get(playerId);
    if (existingPlayer) {
      // Reconnection
      existingPlayer.isConnected = true;
      existingPlayer.socketId = socket.id;
      room.sockets.set(socket.id, playerId);
    } else {
      // New player
      const playerResult = await roomManager.addPlayerToRoom(roomId, playerId, playerName, socket.id);
      if (!playerResult.success) {
        socket.emit('error', { message: playerResult.error });
        return;
      }
    }
    
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = playerId;
    
    // Send current game state
    socket.emit('room:joined', {
      roomId,
      mode: room.mode,
      playerId,
      state: roomManager.serializeRoomState(room)
    });
    
    // Notify others
    socket.to(roomId).emit('room:player_joined', {
      player: room.players.get(playerId)
    });
    
    // Send players list
    const players = roomManager.getPlayersInRoom(roomId);
    io.to(roomId).emit('room:players', { players });
  });

  // Update game state
  socket.on('game:update', async ({ roomId, stateUpdate }) => {
    const result = await roomManager.updateGameState(roomId, stateUpdate);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    // Broadcast updated state to all players in room
    io.to(roomId).emit('game:state', {
      state: roomManager.serializeRoomState(result.state)
    });
  });

  // Generic event forwarding for game-specific events
  socket.on('game:event', ({ roomId, eventType, data }) => {
    // Forward to all other players in the room
    socket.to(roomId).emit('game:event', {
      eventType,
      data,
      playerId: socket.data.playerId
    });
  });

  // ========== CLASSIC MODE EVENTS ==========
  
  // Initialize Classic Mode game
  socket.on('classic:init_game', async ({ roomId }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.mode !== 'classic') {
      socket.emit('error', { message: 'Room is not in Classic mode' });
      return;
    }

    // Initialize game state
    room = ClassicModeLogic.initializeGame(room);
    room.gameState.phase = RoundPhase.PICK_TEAMS;
    
    await roomManager.updateGameState(roomId, {
      gameState: room.gameState,
      playerTeams: room.playerTeams
    });

    // Broadcast updated state including playerTeams
    io.to(roomId).emit('classic:game_initialized', {
      gameState: room.gameState,
      playerTeams: Array.from(room.playerTeams.entries())
    });
  });

  // Join a team
  socket.on('classic:join_team', async ({ roomId, playerId, team }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    room = ClassicModeLogic.joinTeam(room, playerId, team);
    
    await roomManager.updateGameState(roomId, {
      playerTeams: room.playerTeams
    });

    // Broadcast team update
    io.to(roomId).emit('classic:team_updated', {
      playerId,
      team,
      playerTeams: Array.from(room.playerTeams.entries())
    });
  });

  // Start the game (after teams are picked)
  socket.on('classic:start_game', async ({ roomId, startingPlayerId, theme }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    try {
      room = ClassicModeLogic.startGame(room, startingPlayerId, theme);
      
      // Get first spectrum card from selected theme
      // Convert deckSeed string to number for seeded shuffle
      const seedValue = room.gameState.deckSeed
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const card = theme 
        ? getCardByIndexFromTheme(theme, room.gameState.deckIndex, seedValue)
        : getCardByIndex(room.gameState.deckIndex);
      
      await roomManager.updateGameState(roomId, {
        gameState: room.gameState
      });

      // Broadcast game start
      io.to(roomId).emit('classic:game_started', {
        gameState: room.gameState,
        spectrumCard: card
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit clue
  socket.on('classic:submit_clue', async ({ roomId, playerId, clue }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    try {
      room = ClassicModeLogic.submitClue(room, playerId, clue);
      
      await roomManager.updateGameState(roomId, {
        gameState: room.gameState
      });

      // Broadcast clue submission
      io.to(roomId).emit('classic:clue_submitted', {
        gameState: room.gameState
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Update guess position (real-time slider)
  socket.on('classic:update_guess', ({ roomId, guess }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Broadcast guess update to all players in room
    socket.to(roomId).emit('classic:guess_updated', {
      guess
    });
  });

  // Submit guess
  socket.on('classic:submit_guess', async ({ roomId, guess }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    try {
      room = ClassicModeLogic.submitGuess(room, guess);
      
      await roomManager.updateGameState(roomId, {
        gameState: room.gameState
      });

      // Broadcast guess submission
      io.to(roomId).emit('classic:guess_submitted', {
        gameState: room.gameState
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit counter guess
  socket.on('classic:submit_counter_guess', async ({ roomId, direction }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    try {
      room = ClassicModeLogic.submitCounterGuess(room, direction);
      
      await roomManager.updateGameState(roomId, {
        gameState: room.gameState
      });

      // Check if game is over
      const isGameOver = ClassicModeLogic.isGameOver(room);
      const winner = isGameOver ? ClassicModeLogic.getWinner(room) : null;

      // Broadcast counter guess and scores
      io.to(roomId).emit('classic:counter_guess_submitted', {
        gameState: room.gameState,
        isGameOver,
        winner
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Start next round
  socket.on('classic:next_round', async ({ roomId, nextClueGiverId }) => {
    let room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const theme = room.gameState?.theme;

    // Convert deckSeed to number for seeded shuffle
    const seedValue = room.gameState.deckSeed
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get current card for turn summary
    const currentCard = theme 
      ? getCardByIndexFromTheme(theme, room.gameState.deckIndex, seedValue)
      : getCardByIndex(room.gameState.deckIndex);
    
    room = ClassicModeLogic.nextRound(room, nextClueGiverId, currentCard);
    
    // Get next card from theme (with updated deckIndex)
    const nextCard = theme
      ? getCardByIndexFromTheme(theme, room.gameState.deckIndex, seedValue)
      : getCardByIndex(room.gameState.deckIndex);
    
    await roomManager.updateGameState(roomId, {
      gameState: room.gameState
    });

    // Broadcast next round
    io.to(roomId).emit('classic:round_started', {
      gameState: room.gameState,
      spectrumCard: nextCard
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const { roomId } = socket.data;
    if (roomId) {
      await roomManager.removePlayerFromRoom(roomId, socket.id);
      
      // Notify other players
      socket.to(roomId).emit('room:player_left', {
        playerId: socket.data.playerId
      });
      
      // Send updated players list
      const players = roomManager.getPlayersInRoom(roomId);
      io.to(roomId).emit('room:players', { players });
    }
  });

  // Heartbeat for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await roomManager.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  await roomManager.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  🎮 Longwave Server Running
  -------------------------
  Port: ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Mode: ${isProduction ? 'Production (serving client)' : 'Development'}
  Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}
  Access: http://localhost:${PORT}
  `);
});
