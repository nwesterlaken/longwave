import { useState, useEffect } from 'react';
import { RoundPhase, Team, getTeamName } from '../../../shared/gameTypes.js';
import socketManager from '../socket';
import Spectrum from './Spectrum';

function ClassicGame({ roomId, playerId, players }) {
  const [gameState, setGameState] = useState(null);
  const [spectrumCard, setSpectrumCard] = useState(null);
  const [playerTeams, setPlayerTeams] = useState(new Map());
  const [myTeam, setMyTeam] = useState(Team.UNSET);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Available themes
  const themes = [
    { id: 'popculture', emoji: '🎬', name: 'Pop Cultuur' },
    { id: 'privacy', emoji: '🔒', name: 'Privacy & Data' },
    { id: 'ai', emoji: '🤖', name: 'AI & Technologie' },
    { id: 'food', emoji: '🍕', name: 'Eten & Drinken' },
    { id: 'work', emoji: '💼', name: 'Werk & Carrière' },
    { id: 'sports', emoji: '🏃', name: 'Sport & Fitness' },
    { id: 'art', emoji: '🎨', name: 'Kunst & Mode' },
    { id: 'society', emoji: '🌍', name: 'Maatschappij & Politiek' },
    { id: 'gaming', emoji: '🎮', name: 'Gaming & Hobby\'s' },
    { id: 'psychology', emoji: '🧠', name: 'Psychologie & Gedrag' },
    { id: 'daily', emoji: '🏡', name: 'Dagelijks Leven' },
    { id: 'philosophy', emoji: '🎭', name: 'Filosofie & Ethiek' },
    { id: 'quality', emoji: '⚖️', name: 'Quality & Risk' }
  ];

  useEffect(() => {
    // Listen for Classic Mode events
    const handleGameInitialized = (data) => {
      setGameState(data.gameState);
      if (data.playerTeams) {
        const teams = new Map(data.playerTeams);
        setPlayerTeams(teams);
        // Update myTeam if I'm in the teams
        if (teams.has(playerId)) {
          setMyTeam(teams.get(playerId));
        }
      }
    };

    const handleTeamUpdated = (data) => {
      const teams = new Map(data.playerTeams);
      setPlayerTeams(teams);
      
      if (data.playerId === playerId) {
        setMyTeam(data.team);
      }
    };

    const handleGameStarted = (data) => {
      setGameState(data.gameState);
      setSpectrumCard(data.spectrumCard);
    };

    const handleClueSubmitted = (data) => {
      setGameState(data.gameState);
    };

    const handleGuessSubmitted = (data) => {
      setGameState(data.gameState);
    };

    const handleCounterGuessSubmitted = (data) => {
      setGameState(data.gameState);
    };

    const handleRoundStarted = (data) => {
      setGameState(data.gameState);
      setSpectrumCard(data.spectrumCard);
    };

    socketManager.on('classic:game_initialized', handleGameInitialized);
    socketManager.on('classic:team_updated', handleTeamUpdated);
    socketManager.on('classic:game_started', handleGameStarted);
    socketManager.on('classic:clue_submitted', handleClueSubmitted);
    socketManager.on('classic:guess_submitted', handleGuessSubmitted);
    socketManager.on('classic:counter_guess_submitted', handleCounterGuessSubmitted);
    socketManager.on('classic:round_started', handleRoundStarted);

    // Initialize game
    socketManager.send('classic:init_game', { roomId });

    return () => {
      socketManager.off('classic:game_initialized', handleGameInitialized);
      socketManager.off('classic:team_updated', handleTeamUpdated);
      socketManager.off('classic:game_started', handleGameStarted);
      socketManager.off('classic:clue_submitted', handleClueSubmitted);
      socketManager.off('classic:guess_submitted', handleGuessSubmitted);
      socketManager.off('classic:counter_guess_submitted', handleCounterGuessSubmitted);
      socketManager.off('classic:round_started', handleRoundStarted);
    };
  }, [roomId, playerId]);

  const handleJoinTeam = (team) => {
    socketManager.send('classic:join_team', {
      roomId,
      playerId,
      team
    });
  };

  const handleStartGame = () => {
    // Find first player in current player's team to be clue giver
    const myTeamPlayers = Array.from(playerTeams.entries())
      .filter(([_, t]) => t === myTeam)
      .map(([pid]) => pid);
    
    if (myTeamPlayers.length === 0) {
      setError('Je moet eerst een team kiezen');
      return;
    }

    if (!selectedTheme) {
      setError('Kies eerst een thema');
      return;
    }

    socketManager.send('classic:start_game', {
      roomId,
      startingPlayerId: myTeamPlayers[0],
      theme: selectedTheme
    });
  };

  // Debug logging
  console.log('ClassicGame render:', {
    hasGameState: !!gameState,
    phase: gameState?.phase,
    hasSpectrumCard: !!spectrumCard,
    playerId,
    myTeam,
    clueGiver: gameState?.clueGiver
  });

  if (!gameState) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p className="mt-md text-muted">Game wordt geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  // Team Selection Phase
  if (gameState.phase === RoundPhase.PICK_TEAMS) {
    const leftTeamPlayers = Array.from(playerTeams.entries())
      .filter(([_, team]) => team === Team.LEFT)
      .map(([pid]) => players.find(p => p.id === pid))
      .filter(p => p); // Remove undefined
    
    const rightTeamPlayers = Array.from(playerTeams.entries())
      .filter(([_, team]) => team === Team.RIGHT)
      .map(([pid]) => players.find(p => p.id === pid))
      .filter(p => p); // Remove undefined

    const lobbyPlayers = players.filter(p => 
      !playerTeams.has(p.id) || playerTeams.get(p.id) === Team.UNSET
    );

    const allPlayersHaveTeams = players.length > 0 && 
      players.every(p => playerTeams.has(p.id) && playerTeams.get(p.id) !== Team.UNSET);

    return (
      <div className="container" style={{ maxWidth: '900px', marginTop: '2rem' }}>
        <div className="card fade-in">
          <div className="card-header text-center">
            <h2>🎯 Classic Mode</h2>
            <p className="text-muted">Kies je team</p>
          </div>

          <div className="card-body">
            {/* Room Code - Blijf tonen zodat mensen kunnen joinen */}
            <div className="mb-xl" style={{
              padding: 'var(--space-lg)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <p className="text-sm text-muted mb-sm">📢 Deel deze code met andere spelers:</p>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.3em',
                color: 'var(--primary-light)',
                fontFamily: 'monospace',
                marginBottom: 'var(--space-sm)'
              }}>
                {roomId}
              </p>
              <button
                className="btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
              >
                {copiedCode ? '✅ Gekopieerd!' : '📋 Kopieer Code'}
              </button>
              <p className="text-sm text-muted mt-md" style={{ marginBottom: 0 }}>
                💡 Nieuwe spelers kunnen nu nog joinen
              </p>
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

            {/* Lobby - Spelers zonder team */}
            {lobbyPlayers.length > 0 && (
              <div className="mb-lg" style={{
                padding: 'var(--space-md)',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px dashed var(--warning)',
                borderRadius: 'var(--radius-md)'
              }}>
                <h4 className="text-center mb-md" style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>
                  🚪 Lobby ({lobbyPlayers.length})
                </h4>
                <div className="flex flex-wrap gap-sm justify-center">
                  {lobbyPlayers.map(player => (
                    <span key={player.id} style={{
                      padding: '4px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {player.name}
                      {player.id === playerId && ' (jij)'}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm mt-sm" style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
                  ⬇️ Kies een team om te beginnen
                </p>
              </div>
            )}

            <div className="flex gap-xl mb-xl">
              {/* Left Team */}
              <div className="flex-1" style={{
                padding: 'var(--space-lg)',
                background: myTeam === Team.LEFT ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                border: `2px solid ${myTeam === Team.LEFT ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-lg)'
              }}>
                <h3 className="mb-md text-center">{getTeamName(Team.LEFT)}</h3>
                <div className="mb-md">
                  {leftTeamPlayers.map(player => (
                    <div key={player.id} className="mb-sm" style={{
                      padding: 'var(--space-sm)',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {player.name}
                    </div>
                  ))}
                  {leftTeamPlayers.length === 0 && (
                    <p className="text-sm text-muted text-center">Geen spelers</p>
                  )}
                </div>
                <button
                  className="btn-primary w-full"
                  onClick={() => handleJoinTeam(Team.LEFT)}
                  disabled={myTeam === Team.LEFT}
                >
                  {myTeam === Team.LEFT ? '✓ In dit team' : `Join ${getTeamName(Team.LEFT)}`}
                </button>
              </div>

              {/* Right Team */}
              <div className="flex-1" style={{
                padding: 'var(--space-lg)',
                background: myTeam === Team.RIGHT ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                border: `2px solid ${myTeam === Team.RIGHT ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-lg)'
              }}>
                <h3 className="mb-md text-center">{getTeamName(Team.RIGHT)}</h3>
                <div className="mb-md">
                  {rightTeamPlayers.map(player => (
                    <div key={player.id} className="mb-sm" style={{
                      padding: 'var(--space-sm)',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      {player.name}
                    </div>
                  ))}
                  {rightTeamPlayers.length === 0 && (
                    <p className="text-sm text-muted text-center">Geen spelers</p>
                  )}
                </div>
                <button
                  className="btn-primary w-full"
                  onClick={() => handleJoinTeam(Team.RIGHT)}
                  disabled={myTeam === Team.RIGHT}
                >
                  {myTeam === Team.RIGHT ? '✓ In dit team' : `Join ${getTeamName(Team.RIGHT)}`}
                </button>
              </div>
            </div>

            {allPlayersHaveTeams ? (
              <div>
                {/* Theme Selection */}
                {!selectedTheme ? (
                  <div className="mb-lg">
                    <h3 className="text-center mb-md" style={{ color: 'var(--primary-light)' }}>
                      🎭 Kies een thema
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: 'var(--space-md)',
                      marginBottom: 'var(--space-lg)'
                    }}>
                      {themes.map(theme => (
                        <button
                          key={theme.id}
                          className="btn-secondary"
                          onClick={() => setSelectedTheme(theme.id)}
                          style={{
                            padding: 'var(--space-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            minHeight: '80px',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span style={{ fontSize: '2rem' }}>{theme.emoji}</span>
                          <span style={{ fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.2' }}>
                            {theme.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-muted">
                      ℹ️ Kies een thema om de game te starten
                    </p>
                  </div>
                ) : (
                  <div className="mb-lg">
                    <div style={{
                      padding: 'var(--space-md)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '2px solid var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      marginBottom: 'var(--space-md)'
                    }}>
                      <p className="text-sm text-muted mb-sm">Gekozen thema:</p>
                      <p style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                        {themes.find(t => t.id === selectedTheme)?.emoji}{' '}
                        {themes.find(t => t.id === selectedTheme)?.name}
                      </p>
                    </div>
                    <button
                      className="btn-secondary w-full mb-md"
                      onClick={() => setSelectedTheme(null)}
                      style={{ fontSize: '0.9rem' }}
                    >
                      ↩️ Ander thema kiezen
                    </button>
                    <button
                      className="btn-success w-full"
                      onClick={handleStartGame}
                      disabled={players.length < 2}
                      style={{ 
                        fontSize: '1.1rem', 
                        padding: 'var(--space-lg)',
                        opacity: players.length < 2 ? 0.5 : 1,
                        cursor: players.length < 2 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      🚀 Start Game
                    </button>
                    
                    {/* Player count warnings - AFTER Start Game button */}
                    {players.length < 2 && (
                      <div className="mt-md" style={{
                        padding: 'var(--space-lg)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>
                          ⚠️ Te weinig spelers
                        </p>
                        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 0 }}>
                          Je hebt minimaal 2 spelers nodig om het spel te starten.
                        </p>
                      </div>
                    )}
                    
                    {players.length >= 2 && players.length < 4 && (
                      <div className="mt-md" style={{
                        padding: 'var(--space-lg)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '2px solid var(--warning)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: 'var(--warning)', fontWeight: 'bold', marginBottom: 'var(--space-sm)' }}>
                          ⚠️ Waarschuwing
                        </p>
                        <p style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: 0 }}>
                          Het spel werkt het best met minimaal 4 spelers (2 per team).
                          Met {players.length} spelers kan de gameplay beperkt zijn.
                        </p>
                      </div>
                    )}
                    
                    {players.length >= 2 && (
                      <p className="text-center text-sm text-muted mt-md" style={{ marginBottom: 0 }}>
                        ✅ Alle {players.length} spelers hebben een team gekozen
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center" style={{
                padding: 'var(--space-lg)',
                background: 'rgba(245, 158, 11, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--warning)'
              }}>
                <p className="text-sm" style={{ color: 'var(--warning)', marginBottom: 0 }}>
                  ⏳ Wachten tot alle spelers een team hebben gekozen...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const isClueGiver = gameState.clueGiver === playerId;
  const clueGiverTeam = playerTeams.get(gameState.clueGiver);
  const clueGiverPlayer = players.find(p => p.id === gameState.clueGiver);
  const myTeamPlayers = Array.from(playerTeams.entries())
    .filter(([_, t]) => t === myTeam)
    .map(([pid]) => players.find(p => p.id === pid));
  const isMyTeamTurn = clueGiverTeam === myTeam;
  const roundNumber = Math.floor((gameState.turnHistory || []).length) + 1;

  // Show loading if we're in gameplay but don't have spectrum card yet
  if (gameState.phase !== RoundPhase.PICK_TEAMS && !spectrumCard) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p className="mt-md text-muted">Spectrum card wordt geladen...</p>
            <p className="text-sm text-muted">Phase: {gameState.phase}</p>
          </div>
        </div>
      </div>
    );
  }

  // Active gameplay
  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <div className="card fade-in">
        {/* Header with scores */}
        <div className="card-header" style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          borderBottom: '2px solid var(--border-color)'
        }}>
          {/* Round indicator */}
          <div className="text-center mb-md">
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--primary-light)',
              fontWeight: '600'
            }}>
              🎯 Ronde {roundNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            {/* Left Team */}
            <div className="flex-1" style={{
              padding: 'var(--space-md)',
              background: clueGiverTeam === Team.LEFT ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                color: clueGiverTeam === Team.LEFT ? 'var(--primary-light)' : 'var(--text-secondary)',
                marginBottom: '0.25rem',
                fontSize: '1.1rem',
                transition: 'color 0.3s ease'
              }}>
                {clueGiverTeam === Team.LEFT && '👉 '}
                {getTeamName(Team.LEFT)}
              </h3>
              <p style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                marginBottom: 0,
                color: 'var(--primary-light)',
                textShadow: clueGiverTeam === Team.LEFT ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {gameState.leftScore}
              </p>
              {clueGiverTeam === Team.LEFT && clueGiverPlayer && (
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem'
                }}>
                  🎨 Clue: {clueGiverPlayer.name}
                </p>
              )}
            </div>

            {/* Center info */}
            <div className="text-center flex-1">
              <p className="text-muted mb-sm" style={{ fontSize: '0.9rem' }}>
                Classic Mode
              </p>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)',
                fontWeight: '600'
              }}>
                First to 10 🏆
              </p>
            </div>

            {/* Right Team */}
            <div className="flex-1 text-right" style={{
              padding: 'var(--space-md)',
              background: clueGiverTeam === Team.RIGHT ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                color: clueGiverTeam === Team.RIGHT ? 'var(--success)' : 'var(--text-secondary)',
                marginBottom: '0.25rem',
                fontSize: '1.1rem',
                transition: 'color 0.3s ease'
              }}>
                {getTeamName(Team.RIGHT)}
                {clueGiverTeam === Team.RIGHT && ' 👈'}
              </h3>
              <p style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                marginBottom: 0,
                color: 'var(--success)',
                textShadow: clueGiverTeam === Team.RIGHT ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {gameState.rightScore}
              </p>
              {clueGiverTeam === Team.RIGHT && clueGiverPlayer && (
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem'
                }}>
                  🎨 Clue: {clueGiverPlayer.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Give Clue Phase */}
          {gameState.phase === RoundPhase.GIVE_CLUE && (
            <GiveCluePhase
              spectrumCard={spectrumCard}
              target={gameState.spectrumTarget}
              isClueGiver={isClueGiver}
              roomId={roomId}
              playerId={playerId}
            />
          )}

          {/* Make Guess Phase */}
          {gameState.phase === RoundPhase.MAKE_GUESS && (
            <MakeGuessPhase
              spectrumCard={spectrumCard}
              clue={gameState.clue}
              isMyTeamTurn={isMyTeamTurn}
              isClueGiver={isClueGiver}
              roomId={roomId}
            />
          )}

          {/* Counter Guess Phase */}
          {gameState.phase === RoundPhase.COUNTER_GUESS && (
            <CounterGuessPhase
              spectrumCard={spectrumCard}
              clue={gameState.clue}
              guess={gameState.guess}
              isMyTeamTurn={isMyTeamTurn}
              roomId={roomId}
            />
          )}

          {/* View Score Phase */}
          {gameState.phase === RoundPhase.VIEW_SCORE && (
            <ViewScorePhase
              spectrumCard={spectrumCard}
              clue={gameState.clue}
              target={gameState.spectrumTarget}
              guess={gameState.guess}
              counterGuess={gameState.counterGuess}
              leftScore={gameState.leftScore}
              rightScore={gameState.rightScore}
              clueGiverTeam={clueGiverTeam}
              roomId={roomId}
              players={players}
              playerTeams={playerTeams}
              myTeam={myTeam}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Phase Components
function GiveCluePhase({ spectrumCard, target, isClueGiver, roomId, playerId }) {
  const [clue, setClue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitClue = () => {
    if (clue.trim()) {
      setSubmitting(true);
      socketManager.send('classic:submit_clue', {
        roomId,
        playerId,
        clue: clue.trim()
      });
    }
  };

  if (!isClueGiver) {
    return (
      <div className="text-center slide-up">
        <div className="mb-lg">
          <div className="spinner pulse" style={{ margin: '0 auto' }}></div>
        </div>
        <h3 className="mb-md">⏳ Wachten op hint...</h3>
        <p className="text-muted">De clue giver bedenkt een hint</p>
        <div className="mt-lg" style={{
          padding: 'var(--space-md)',
          background: 'rgba(99, 102, 241, 0.05)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          💡 Tip: De clue giver mag alleen één woord of korte hint geven
        </div>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="text-center mb-xl scale-in">
        <div style={{
          display: 'inline-block',
          padding: 'var(--space-lg)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--primary)',
          marginBottom: 'var(--space-md)'
        }}>
          <h2 className="mb-sm" style={{ fontSize: '2rem' }}>🎨 Jij geeft de hint!</h2>
          <p className="text-muted" style={{ marginBottom: 0 }}>Bekijk het spectrum en de target</p>
        </div>
      </div>

      {spectrumCard && (
        <div className="slide-up" style={{ animationDelay: '0.1s' }}>
          <Spectrum
            leftLabel={spectrumCard[0]}
            rightLabel={spectrumCard[1]}
            target={target}
            showTarget={true}
          />
        </div>
      )}

      <div className="mt-xl slide-up" style={{
        padding: 'var(--space-xl)',
        background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--primary)',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
        animationDelay: '0.2s'
      }}>
        <label htmlFor="clue" className="block mb-md text-center" style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600',
          color: 'var(--primary-light)'
        }}>
          ✍️ Jouw Hint
        </label>
        <input
          id="clue"
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Eén woord of korte hint..."
          maxLength={50}
          style={{ 
            fontSize: '1.3rem', 
            textAlign: 'center',
            padding: 'var(--space-lg)',
            background: 'var(--bg-primary)',
            border: `2px solid ${clue.trim() ? 'var(--primary)' : 'var(--border-color)'}`,
            transition: 'all 0.3s ease'
          }}
          autoFocus
          disabled={submitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && clue.trim() && !submitting) {
              handleSubmitClue();
            }
          }}
        />
        <div className="flex justify-between items-center mt-sm" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{clue.length}/50</span>
          <span>↵ Enter om te versturen</span>
        </div>
        <button
          className={`btn-primary w-full mt-lg ${submitting ? 'pulse' : ''}`}
          onClick={handleSubmitClue}
          disabled={!clue.trim() || submitting}
          style={{ 
            fontSize: '1.1rem',
            padding: 'var(--space-lg)',
            background: submitting ? 'var(--success)' : undefined
          }}
        >
          {submitting ? '✅ Versturen...' : '✅ Verstuur Hint'}
        </button>
      </div>

      <div className="mt-lg text-center slide-up" style={{
        padding: 'var(--space-md)',
        background: 'rgba(245, 158, 11, 0.05)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        color: 'var(--warning)',
        animationDelay: '0.3s'
      }}>
        ⚠️ Let op: Je team mag de target NIET zien!
      </div>
    </div>
  );
}

function MakeGuessPhase({ spectrumCard, clue, isMyTeamTurn, isClueGiver, roomId }) {
  const [guess, setGuess] = useState(10);

  useEffect(() => {
    // Listen for guess updates from other team members
    const handleGuessUpdated = (data) => {
      setGuess(data.guess);
    };

    socketManager.on('classic:guess_updated', handleGuessUpdated);

    return () => {
      socketManager.off('classic:guess_updated', handleGuessUpdated);
    };
  }, []);

  const handleGuessChange = (newGuess) => {
    setGuess(newGuess);
    // Broadcast guess update to other players
    socketManager.send('classic:update_guess', {
      roomId,
      guess: newGuess
    });
  };

  const handleSubmitGuess = () => {
    socketManager.send('classic:submit_guess', {
      roomId,
      guess
    });
  };

  // If not my team's turn, show waiting state
  if (!isMyTeamTurn) {
    return (
      <div className="text-center">
        <div className="mb-lg">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
        <h3 className="mb-md">⏳ Het andere team raadt...</h3>
        <div className="mt-lg" style={{
          padding: 'var(--space-lg)',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p className="mb-sm" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>De hint:</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
            "{clue}"
          </p>
        </div>
      </div>
    );
  }

  // If I'm the clue giver, show spectrum but don't allow changes
  if (isClueGiver) {
    return (
      <div>
        <div className="text-center mb-xl">
          <h2 className="mb-md">⏳ Je team raadt...</h2>
          <div style={{
            padding: 'var(--space-lg)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-block'
          }}>
            <p className="mb-sm" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Jouw hint:</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-light)', marginBottom: 0 }}>
              "{clue}"
            </p>
          </div>
        </div>

        {spectrumCard && (
          <Spectrum
            leftLabel={spectrumCard[0]}
            rightLabel={spectrumCard[1]}
            guess={guess}
            onGuessChange={null}
          />
        )}

        <div className="mt-lg text-center" style={{
          padding: 'var(--space-md)',
          background: 'rgba(245, 158, 11, 0.05)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--warning)'
        }}>
          👁️ Je kunt zien wat je team raadt, maar je mag de slider niet aanpassen
        </div>
      </div>
    );
  }

  // Team members (except clue giver) can guess
  return (
    <div>
      <div className="text-center mb-xl">
        <h2 className="mb-md">🤔 Raad de positie!</h2>
        <div style={{
          padding: 'var(--space-lg)',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          display: 'inline-block'
        }}>
          <p className="mb-sm" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>De hint:</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-light)', marginBottom: 0 }}>
            "{clue}"
          </p>
        </div>
      </div>

      {spectrumCard && (
        <Spectrum
          leftLabel={spectrumCard[0]}
          rightLabel={spectrumCard[1]}
          guess={guess}
          onGuessChange={handleGuessChange}
        />
      )}

      <div className="mt-lg text-center" style={{
        padding: 'var(--space-md)',
        background: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        color: 'var(--success)'
      }}>
        👥 Alle teamleden (behalve de hint gever) kunnen de slider aanpassen
      </div>

      <button
        className="btn-success w-full mt-lg"
        onClick={handleSubmitGuess}
        style={{ fontSize: '1.2rem', padding: 'var(--space-lg)' }}
      >
        🎯 Bevestig Guess: {guess}
      </button>
    </div>
  );
}

function CounterGuessPhase({ spectrumCard, clue, guess, isMyTeamTurn, roomId }) {
  const handleCounterGuess = (direction) => {
    socketManager.send('classic:submit_counter_guess', {
      roomId,
      direction
    });
  };

  if (isMyTeamTurn) {
    return (
      <div className="text-center">
        <div className="mb-lg">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
        <h3 className="mb-md">⏳ Het andere team raadt de richting...</h3>
        <div className="mt-lg" style={{
          padding: 'var(--space-lg)',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p className="text-muted mb-sm">Jullie guess:</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>
            {guess}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-xl">
        <h2 className="mb-md">🎲 Counter Guess!</h2>
        <p className="text-muted">Is de target links of rechts van hun guess?</p>
      </div>

      {spectrumCard && (
        <Spectrum
          leftLabel={spectrumCard[0]}
          rightLabel={spectrumCard[1]}
          guess={guess}
        />
      )}

      <div className="flex gap-xl mt-xl">
        <button
          className="btn-primary flex-1"
          onClick={() => handleCounterGuess('left')}
          style={{ fontSize: '1.5rem', padding: 'var(--space-xl)' }}
        >
          ⬅️ Links
        </button>
        <button
          className="btn-primary flex-1"
          onClick={() => handleCounterGuess('right')}
          style={{ fontSize: '1.5rem', padding: 'var(--space-xl)' }}
        >
          Rechts ➡️
        </button>
      </div>

      <div className="mt-lg text-center">
        <p className="text-sm text-muted">
          Kies de richting waar je denkt dat de target zich bevindt
        </p>
      </div>
    </div>
  );
}

function ViewScorePhase({ spectrumCard, clue, target, guess, counterGuess, leftScore, rightScore, clueGiverTeam, roomId, players, playerTeams, myTeam }) {
  const distance = Math.abs(target - guess);
  const guessScore = distance === 0 ? 4 : distance <= 2 ? 3 : distance <= 3 ? 2 : 0;
  
  const counterCorrect = (counterGuess === 'left' && guess > target) || 
                         (counterGuess === 'right' && guess < target);
  const counterScore = counterCorrect ? 1 : 0;

  const handleNextRound = () => {
    // Find next clue giver (rotate through team)
    const myTeamPlayers = Array.from(playerTeams.entries())
      .filter(([_, t]) => t === myTeam)
      .map(([pid]) => pid);
    
    const nextClueGiver = myTeamPlayers[0] || players[0].id;

    socketManager.send('classic:next_round', {
      roomId,
      nextClueGiverId: nextClueGiver
    });
  };

  const isGameOver = leftScore >= 10 || rightScore >= 10;
  const winner = leftScore >= 10 ? Team.LEFT : rightScore >= 10 ? Team.RIGHT : null;

  return (
    <div>
      {isGameOver ? (
        <div className="text-center mb-xl">
          <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
            🎉 {getTeamName(winner)} Wint! 🎉
          </h1>
          <p style={{ fontSize: '2rem', color: 'var(--primary-light)' }}>
            {leftScore} - {rightScore}
          </p>
        </div>
      ) : (
        <div className="text-center mb-xl">
          <h2 className="mb-md">📊 Resultaten</h2>
          <div style={{
            padding: 'var(--space-lg)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-block'
          }}>
            <p className="mb-sm" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>De hint was:</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-light)', marginBottom: 0 }}>
              "{clue}"
            </p>
          </div>
        </div>
      )}

      {spectrumCard && (
        <Spectrum
          leftLabel={spectrumCard[0]}
          rightLabel={spectrumCard[1]}
          target={target}
          guess={guess}
          showTarget={true}
        />
      )}

      <div className="mt-xl grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Guessing team score */}
        <div style={{
          padding: 'var(--space-lg)',
          background: guessScore > 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
          border: `2px solid ${guessScore > 0 ? 'var(--success)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <h3 className="mb-md">{getTeamName(clueGiverTeam)}</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: guessScore > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
            +{guessScore}
          </p>
          <p className="text-sm text-muted">
            {distance === 0 && '🎯 Perfect!'}
            {distance > 0 && distance <= 2 && '🎉 Zeer dichtbij!'}
            {distance > 2 && distance <= 3 && '👍 Dichtbij'}
            {distance > 3 && '❌ Te ver'}
          </p>
        </div>

        {/* Counter team score */}
        <div style={{
          padding: 'var(--space-lg)',
          background: counterScore > 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
          border: `2px solid ${counterScore > 0 ? 'var(--success)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <h3 className="mb-md">{getTeamName(clueGiverTeam === Team.LEFT ? Team.RIGHT : Team.LEFT)}</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: counterScore > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
            +{counterScore}
          </p>
          <p className="text-sm text-muted">
            Counter guess: {counterGuess === 'left' ? '⬅️' : '➡️'}
            {counterCorrect ? ' ✅' : ' ❌'}
          </p>
        </div>
      </div>

      {!isGameOver && (
        <button
          className="btn-success w-full mt-xl"
          onClick={handleNextRound}
          style={{ fontSize: '1.2rem', padding: 'var(--space-lg)' }}
        >
          ▶️ Volgende Ronde
        </button>
      )}
    </div>
  );
}

export default ClassicGame;
