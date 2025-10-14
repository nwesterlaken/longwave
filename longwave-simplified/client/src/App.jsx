import { useState, useEffect } from 'react';
import socketManager from './socket';
import ClassicGame from './components/ClassicGame';
import './styles.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Connect to server
    socketManager.connect();

    // Setup event listeners
    const handleConnected = () => {
      setConnected(true);
      setError('');
    };

    const handleDisconnected = () => {
      setConnected(false);
    };

    const handleError = (err) => {
      setError(err.message || 'Connection error');
    };

    const handleRoomJoined = (data) => {
      setCurrentRoom(data);
      setError('');
    };

    const handleRoomPlayers = (data) => {
      setPlayers(data.players);
    };

    const handleSocketError = (data) => {
      setError(data.message || 'An error occurred');
    };

    socketManager.on('socket:connected', handleConnected);
    socketManager.on('socket:disconnected', handleDisconnected);
    socketManager.on('socket:error', handleError);
    socketManager.on('room:joined', handleRoomJoined);
    socketManager.on('room:players', handleRoomPlayers);
    socketManager.on('error', handleSocketError);

    // Cleanup
    return () => {
      socketManager.off('socket:connected', handleConnected);
      socketManager.off('socket:disconnected', handleDisconnected);
      socketManager.off('socket:error', handleError);
      socketManager.off('room:joined', handleRoomJoined);
      socketManager.off('room:players', handleRoomPlayers);
      socketManager.off('error', handleSocketError);
    };
  }, []);

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = (mode) => {
    if (!playerName.trim()) {
      setError('Voer je naam in');
      return;
    }

    const newRoomId = generateRoomId();
    const newPlayerId = `player_${Date.now()}`;

    socketManager.send('room:create', {
      roomId: newRoomId,
      mode,
      playerId: newPlayerId,
      playerName: playerName.trim()
    });

    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Voer je naam in');
      return;
    }

    if (!roomId.trim()) {
      setError('Voer een room code in');
      return;
    }

    const newPlayerId = `player_${Date.now()}`;

    socketManager.send('room:join', {
      roomId: roomId.trim().toUpperCase(),
      playerId: newPlayerId,
      playerName: playerName.trim()
    });

    setPlayerId(newPlayerId);
  };

  if (!connected) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="card text-center">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p className="mt-md text-muted">Verbinden met server...</p>
        </div>
      </div>
    );
  }

  if (currentRoom) {
    // If in Classic Mode, show ClassicGame component
    if (currentRoom.mode === 'classic') {
      return <ClassicGame roomId={currentRoom.roomId} playerId={playerId} players={players} />;
    }

    // Fallback for other modes
    return (
      <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
        <div className="card fade-in">
          <div className="card-header">
            <h2>Room: {currentRoom.roomId}</h2>
            <p className="text-muted">Mode: {currentRoom.mode}</p>
          </div>
          <div className="card-body">
            <div className="mb-lg" style={{
              padding: 'var(--space-lg)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <p className="text-sm text-muted mb-sm">Deel deze code met andere spelers:</p>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                letterSpacing: '0.3em',
                color: 'var(--primary-light)',
                fontFamily: 'monospace',
                marginBottom: '0'
              }}>
                {currentRoom.roomId}
              </p>
              <button
                className="btn-secondary btn-sm mt-md"
                onClick={() => {
                  navigator.clipboard.writeText(currentRoom.roomId);
                  alert('Room code gekopieerd!');
                }}
              >
                📋 Kopieer Code
              </button>
            </div>

            <div className="mb-lg">
              <h3 className="mb-md">Spelers ({players.length}):</h3>
              {players.map(player => (
                <div key={player.id} className="mb-sm" style={{
                  padding: 'var(--space-sm)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {player.name} {player.id === playerId && '(jij)'}
                </div>
              ))}
            </div>

            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p className="text-sm text-muted mb-sm">
                ℹ️ <strong>Opmerking:</strong> Deze mode is nog niet geïmplementeerd.
              </p>
              <p className="text-sm text-muted" style={{ marginBottom: 0 }}>
                Classic Mode is beschikbaar. Pulse Check Mode volgt binnenkort.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '3rem' }}>
      <div className="card fade-in">
        <div className="card-header text-center">
          <h1>Longwave</h1>
          <p className="text-muted">Team Building Game</p>
        </div>

        <div className="card-body">
          {error && (
            <div className="mb-lg" style={{
              padding: 'var(--space-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          {/* Naam invoer los van de rest */}
          <div className="mb-xl" style={{
            padding: 'var(--space-lg)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-color)'
          }}>
            <label htmlFor="playerName" className="block mb-sm text-center" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              Stap 1: Voer je naam in
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Je naam..."
              maxLength={20}
              style={{ fontSize: '1.1rem', textAlign: 'center' }}
            />
          </div>

          <div className="text-center mb-lg text-muted" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            Stap 2: Kies een optie
          </div>

          <div className="flex gap-xl" style={{ alignItems: 'stretch' }}>
            {/* Nieuwe game starten */}
            <div className="flex-1" style={{
              padding: 'var(--space-lg)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)'
            }}>
              <h3 className="mb-md text-center">Nieuwe Game</h3>
              <p className="text-sm text-muted mb-lg text-center">
                Start een nieuwe game als host
              </p>
              <div className="flex flex-col gap-md">
                <button
                  className="btn-primary"
                  onClick={() => handleCreateRoom('classic')}
                  disabled={!playerName.trim()}
                >
                  🎯 Classic Mode
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleCreateRoom('pulsecheck')}
                  disabled={!playerName.trim()}
                >
                  📊 Pulse Check
                </button>
              </div>
            </div>

            {/* Join bestaande game */}
            <div className="flex-1" style={{
              padding: 'var(--space-lg)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)'
            }}>
              <h3 className="mb-md text-center">Join Game</h3>
              <p className="text-sm text-muted mb-lg text-center">
                Join een bestaande game met code
              </p>
              <div className="mb-md">
                <label htmlFor="roomCode" className="block mb-sm text-center">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  style={{ textTransform: 'uppercase', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }}
                />
              </div>
              <button
                className="btn-success w-full"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomId.trim()}
              >
                🚀 Join Room
              </button>
            </div>
          </div>
        </div>

        <div className="card-footer" style={{ justifyContent: 'center' }}>
          <span className={`badge ${connected ? 'badge-success' : 'badge-danger'}`}>
            {connected ? '● Verbonden' : '● Niet verbonden'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
