// Shared types between server and client for Longwave game

export const GameMode = {
  CLASSIC: 'classic',
  PULSE_CHECK: 'pulsecheck'
};

export const RoundPhase = {
  SETUP: 'setup',
  PICK_TEAMS: 'pick_teams',
  GIVE_CLUE: 'give_clue',
  MAKE_GUESS: 'make_guess',
  COUNTER_GUESS: 'counter_guess',
  VIEW_SCORE: 'view_score'
};

export const Team = {
  UNSET: 'unset',
  LEFT: 'left',
  RIGHT: 'right'
};

export function getOppositeTeam(team) {
  if (team === Team.LEFT) return Team.RIGHT;
  if (team === Team.RIGHT) return Team.LEFT;
  return Team.UNSET;
}

export function getTeamName(team) {
  if (team === Team.LEFT) return 'Links Brein';
  if (team === Team.RIGHT) return 'Rechts Brein';
  return 'Speler';
}

// Generate random spectrum target (0-20)
export function randomSpectrumTarget() {
  return Math.floor(Math.random() * 21);
}

// Generate random 4-character string for deck seed
export function randomSeed() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Calculate score based on guess accuracy
export function calculateScore(target, guess) {
  const distance = Math.abs(target - guess);
  
  if (distance === 0) return 4; // Perfect guess
  if (distance <= 2) return 3;  // Very close
  if (distance <= 3) return 2;  // Close
  return 0; // Too far
}

// Initial game state for Classic Mode
export function createClassicGameState() {
  return {
    mode: GameMode.CLASSIC,
    phase: RoundPhase.SETUP,
    turnsTaken: -1,
    deckSeed: randomSeed(),
    deckIndex: 0,
    spectrumTarget: randomSpectrumTarget(),
    clue: '',
    guess: 0,
    counterGuess: 'left',
    clueGiver: null,
    leftScore: 0,
    rightScore: 0,
    previousTurn: null
  };
}

// Game state for a single turn
export function createTurnSummary(spectrumCard, clueGiverName, clue, target, guess) {
  return {
    spectrumCard,
    clueGiverName,
    clue,
    spectrumTarget: target,
    guess
  };
}
