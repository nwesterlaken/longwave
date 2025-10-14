import { useState, useEffect } from 'react';
import { RoundPhase, Team, getTeamName } from '../../../shared/gameTypes.js';
import socketManager from '../socket';
import Spectrum from './Spectrum';

function ClassicGame({ roomId, playerId, players }) {
  const [gameState, setGameState] = useState(null);
  const [spectrumCard, setSpectrumCard] = useState(null);
  const [playerTeams, setPlayerTeams] = useState(new Map());
  const [myTeam, setMyTeam] = useState(Team.UNSET);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for Classic Mode events
    const handleGameInitialized = (data) => {
      setGameState(data.gameState);
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

    socketManager.send('classic:start_game', {
      roomId,
      startingPlayerId: myTeamPlayers[0]
    });
  };

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
      .map(([pid]) => players.find(p => p.id === pid));
    
    const rightTeamPlayers = Array.from(playerTeams.entries())
      .filter(([_, team]) => team === Team.RIGHT)
      .map(([pid]) => players.find(p => p.id === pid));

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
                  {myTeam === Team.LEFT ? '✓ In dit team' : 'Join Links Brein'}
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
                  {myTeam === Team.RIGHT ? '✓ In dit team' : 'Join Rechts Brein'}
                </button>
              </div>
            </div>

            {allPlayersHaveTeams && (
              <button
                className="btn-success w-full"
                onClick={handleStartGame}
              >
                🚀 Start Game
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const isClueGiver = gameState.clueGiver === playerId;
  const clueGiverTeam = playerTeams.get(gameState.clueGiver);
  const myTeamPlayers = Array.from(playerTeams.entries())
    .filter(([_, t]) => t === myTeam)
    .map(([pid]) => players.find(p => p.id === pid));
  const isMyTeamTurn = clueGiverTeam === myTeam;

  // Active gameplay
  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <div className="card fade-in">
        {/* Header with scores */}
        <div className="card-header" style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          borderBottom: '2px solid var(--border-color)'
        }}>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 style={{ 
                color: clueGiverTeam === Team.LEFT ? 'var(--primary-light)' : 'var(--text-secondary)',
                marginBottom: '0.25rem'
              }}>
                {getTeamName(Team.LEFT)}
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                marginBottom: 0,
                color: 'var(--primary-light)'
              }}>
                {gameState.leftScore}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-muted mb-sm">🎯 Classic Mode</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Eerste naar 10 punten wint!
              </p>
            </div>
            <div className="flex-1 text-right">
              <h3 style={{ 
                color: clueGiverTeam === Team.RIGHT ? 'var(--primary-light)' : 'var(--text-secondary)',
                marginBottom: '0.25rem'
              }}>
                {getTeamName(Team.RIGHT)}
              </h3>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold',
                marginBottom: 0,
                color: 'var(--success)'
              }}>
                {gameState.rightScore}
              </p>
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

  const handleSubmitClue = () => {
    if (clue.trim()) {
      socketManager.send('classic:submit_clue', {
        roomId,
        playerId,
        clue: clue.trim()
      });
    }
  };

  if (!isClueGiver) {
    return (
      <div className="text-center">
        <div className="mb-lg">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
        <h3 className="mb-md">⏳ Wachten op hint...</h3>
        <p className="text-muted">De clue giver bedenkt een hint</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-xl">
        <h2 className="mb-md">🎨 Jij geeft de hint!</h2>
        <p className="text-muted mb-lg">Bekijk het spectrum en de target, en geef een hint</p>
      </div>

      {spectrumCard && (
        <Spectrum
          leftLabel={spectrumCard[0]}
          rightLabel={spectrumCard[1]}
          target={target}
          showTarget={true}
        />
      )}

      <div className="mt-xl" style={{
        padding: 'var(--space-lg)',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--primary)'
      }}>
        <label htmlFor="clue" className="block mb-md text-center" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          Jouw Hint
        </label>
        <input
          id="clue"
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Typ een hint..."
          maxLength={50}
          style={{ fontSize: '1.2rem', textAlign: 'center' }}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter' && clue.trim()) {
              handleSubmitClue();
            }
          }}
        />
        <button
          className="btn-primary w-full mt-md"
          onClick={handleSubmitClue}
          disabled={!clue.trim()}
        >
          ✅ Verstuur Hint
        </button>
      </div>
    </div>
  );
}

function MakeGuessPhase({ spectrumCard, clue, isMyTeamTurn, roomId }) {
  const [guess, setGuess] = useState(10);

  const handleSubmitGuess = () => {
    socketManager.send('classic:submit_guess', {
      roomId,
      guess
    });
  };

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
          onGuessChange={setGuess}
        />
      )}

      <button
        className="btn-success w-full mt-xl"
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
