import { 
  RoundPhase, 
  Team, 
  getOppositeTeam, 
  randomSpectrumTarget,
  calculateScore,
  createTurnSummary,
  createClassicGameState
} from '../../shared/gameTypes.js';

class ClassicModeLogic {
  // Initialize a new classic game
  static initializeGame(room) {
    const gameState = createClassicGameState();
    
    // Merge with room data
    return {
      ...room,
      gameState,
      playerTeams: new Map() // playerId -> team
    };
  }

  // Start the game (after teams are picked)
  static startGame(room, startingPlayerId) {
    const playerTeam = room.playerTeams.get(startingPlayerId);
    
    // Give the opposite team 1 point to start (balancing)
    const oppositeTeam = getOppositeTeam(playerTeam);
    const initialScores = {};
    
    if (oppositeTeam === Team.LEFT) {
      initialScores.leftScore = 1;
      initialScores.rightScore = 0;
    } else {
      initialScores.leftScore = 0;
      initialScores.rightScore = 1;
    }

    room.gameState = {
      ...room.gameState,
      ...initialScores,
      clueGiver: startingPlayerId,
      phase: RoundPhase.GIVE_CLUE,
      turnsTaken: 0
    };

    return room;
  }

  // Player joins a team
  static joinTeam(room, playerId, team) {
    room.playerTeams.set(playerId, team);
    return room;
  }

  // Submit a clue
  static submitClue(room, playerId, clue) {
    if (room.gameState.phase !== RoundPhase.GIVE_CLUE) {
      throw new Error('Not in clue giving phase');
    }

    if (room.gameState.clueGiver !== playerId) {
      throw new Error('Only the clue giver can submit a clue');
    }

    room.gameState = {
      ...room.gameState,
      clue,
      phase: RoundPhase.MAKE_GUESS
    };

    return room;
  }

  // Submit a guess
  static submitGuess(room, guess) {
    if (room.gameState.phase !== RoundPhase.MAKE_GUESS) {
      throw new Error('Not in guessing phase');
    }

    room.gameState = {
      ...room.gameState,
      guess,
      phase: RoundPhase.COUNTER_GUESS
    };

    return room;
  }

  // Submit counter guess
  static submitCounterGuess(room, direction) {
    if (room.gameState.phase !== RoundPhase.COUNTER_GUESS) {
      throw new Error('Not in counter guess phase');
    }

    room.gameState = {
      ...room.gameState,
      counterGuess: direction,
      phase: RoundPhase.VIEW_SCORE
    };

    // Calculate scores
    const { spectrumTarget, guess, counterGuess } = room.gameState;
    const clueGiverTeam = room.playerTeams.get(room.gameState.clueGiver);
    const oppositeTeam = getOppositeTeam(clueGiverTeam);

    // Points for the guessing team
    const guessScore = calculateScore(spectrumTarget, guess);
    
    // Points for counter guess
    let counterScore = 0;
    if (counterGuess === 'left' && guess > spectrumTarget) {
      counterScore = 1;
    } else if (counterGuess === 'right' && guess < spectrumTarget) {
      counterScore = 1;
    }

    // Add scores
    if (clueGiverTeam === Team.LEFT) {
      room.gameState.leftScore += guessScore;
      room.gameState.rightScore += counterScore;
    } else {
      room.gameState.rightScore += guessScore;
      room.gameState.leftScore += counterScore;
    }

    return room;
  }

  // Start next round
  static nextRound(room, nextClueGiverId, spectrumCard) {
    const currentClueGiver = room.players.get(room.gameState.clueGiver);
    
    // Save previous turn
    const previousTurn = createTurnSummary(
      spectrumCard,
      currentClueGiver ? currentClueGiver.name : 'Unknown',
      room.gameState.clue,
      room.gameState.spectrumTarget,
      room.gameState.guess
    );

    room.gameState = {
      ...room.gameState,
      clueGiver: nextClueGiverId,
      phase: RoundPhase.GIVE_CLUE,
      turnsTaken: room.gameState.turnsTaken + 1,
      deckIndex: room.gameState.deckIndex + 1,
      spectrumTarget: randomSpectrumTarget(),
      clue: '',
      guess: 0,
      counterGuess: 'left',
      previousTurn
    };

    return room;
  }

  // Check if game is over (first to 10 points)
  static isGameOver(room) {
    return room.gameState.leftScore >= 10 || room.gameState.rightScore >= 10;
  }

  // Get winner
  static getWinner(room) {
    if (room.gameState.leftScore >= 10) return Team.LEFT;
    if (room.gameState.rightScore >= 10) return Team.RIGHT;
    return null;
  }

  // Get spectrum card based on deck index and seed
  static getSpectrumCard(deckIndex, deckSeed, cards) {
    // Simple deterministic card selection based on seed and index
    // This ensures all players see the same card
    const seedValue = deckSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cardIndex = (seedValue + deckIndex) % cards.length;
    return cards[cardIndex];
  }
}

export default ClassicModeLogic;
