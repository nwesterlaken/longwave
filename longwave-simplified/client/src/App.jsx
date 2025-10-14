import { useState, useEffect } from 'react';
import socketManager from './socket';
import ClassicGame from './components/ClassicGame';
import './styles.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState(() => {
    // Load saved name from localStorage
    return localStorage.getItem('longwave_player_name') || '';
  });
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

    // Save name to localStorage
    localStorage.setItem('longwave_player_name', playerName.trim());

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

    // Save name to localStorage
    localStorage.setItem('longwave_player_name', playerName.trim());

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
    <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <div className="card fade-in">
        <div className="card-header text-center">
          <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🌊 Longwave</h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: 0 }}>Teamwork door synchronisatie</p>
        </div>

        <div className="card-body">
          {/* Game Explanation with SVG */}
          <div className="mb-xl" style={{
            padding: 'var(--space-xl)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex gap-xl" style={{ alignItems: 'center' }}>
              {/* SVG Illustration */}
              <div style={{ flex: '0 0 200px' }}>
                <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto' }}>
                  {/* Brain outline */}
                  <path d="M100,40 Q80,30 70,50 Q60,70 65,90 Q55,100 60,120 Q65,140 80,150 Q90,155 100,160 Q110,155 120,150 Q135,140 140,120 Q145,100 135,90 Q140,70 130,50 Q120,30 100,40" 
                    fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.6"/>
                  
                  {/* Left hemisphere */}
                  <ellipse cx="75" cy="90" rx="25" ry="35" fill="#6366f1" opacity="0.2"/>
                  <text x="75" y="95" textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">L</text>
                  
                  {/* Right hemisphere */}
                  <ellipse cx="125" cy="90" rx="25" ry="35" fill="#a855f7" opacity="0.2"/>
                  <text x="125" y="95" textAnchor="middle" fontSize="12" fill="#a855f7" fontWeight="bold">R</text>
                  
                  {/* Connecting wave */}
                  <path d="M60,100 Q70,95 80,100 Q90,105 100,100 Q110,95 120,100 Q130,105 140,100" 
                    fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2"/>
                  
                  {/* Target marker */}
                  <circle cx="100" cy="100" r="8" fill="#ef4444" opacity="0.6"/>
                  <circle cx="100" cy="100" r="3" fill="#ef4444"/>
                  
                  {/* Spectrum line */}
                  <line x1="40" y1="170" x2="160" y2="170" stroke="#64748b" strokeWidth="3" strokeLinecap="round"/>
                  <text x="40" y="190" fontSize="10" fill="#64748b">Links</text>
                  <text x="160" y="190" textAnchor="end" fontSize="10" fill="#64748b">Rechts</text>
                </svg>
              </div>
              
              {/* Explanation text */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--primary-light)' }}>
                  Hoe werkt het?
                </h3>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>🎯</span>
                    <span>Twee teams proberen op dezelfde golflengte te komen</span>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>💭</span>
                    <span>Één speler geeft een hint, het team raadt de positie</span>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>📊</span>
                    <span>Hoe dichter bij de target, hoe meer punten!</span>
                  </li>
                  <li style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <span>🏆</span>
                    <span>Eerste team naar 10 punten wint</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

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

          {/* Steps */}
          <div className="flex gap-lg mb-lg" style={{ alignItems: 'stretch' }}>
            {/* Step 1: Name input */}
            <div className="flex-1" style={{
              padding: 'var(--space-xl)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 className="text-center mb-md" style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary-light)' }}>
                Stap 1: Voer je naam in
              </h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Je naam..."
                  maxLength={20}
                  style={{ fontSize: '1.1rem', textAlign: 'center', width: '100%' }}
                />
              </div>
            </div>

            {/* Step 2: Choose option */}
            <div className="flex-1" style={{
              padding: 'var(--space-xl)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 className="text-center mb-lg" style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary-light)' }}>
                Stap 2: Kies een optie
              </h3>
              
              <div className="flex gap-md" style={{ flex: 1 }}>
                {/* Nieuwe game */}
                <div className="flex-1" style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 className="text-center mb-sm" style={{ fontSize: '1rem' }}>Nieuwe Game</h4>
                    <p className="text-sm text-muted text-center" style={{ marginBottom: 0 }}>
                      Start als host
                    </p>
                  </div>
                  <button
                    className="btn-primary w-full"
                    onClick={() => handleCreateRoom('classic')}
                    disabled={!playerName.trim()}
                    style={{ padding: 'var(--space-md)', fontSize: '1rem' }}
                  >
                    🎯 Start
                  </button>
                </div>

                {/* Join game */}
                <div className="flex-1" style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 className="text-center mb-sm" style={{ fontSize: '1rem' }}>Join Game</h4>
                    <input
                      id="roomCode"
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      style={{ 
                        textTransform: 'uppercase', 
                        textAlign: 'center', 
                        fontSize: '1rem', 
                        letterSpacing: '0.2em',
                        padding: 'var(--space-sm)'
                      }}
                    />
                  </div>
                  <button
                    className="btn-success w-full"
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomId.trim()}
                    style={{ padding: 'var(--space-md)', fontSize: '1rem' }}
                  >
                    🚀 Join
                  </button>
                </div>
              </div>
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
