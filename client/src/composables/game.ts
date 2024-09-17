import { ref } from "vue";

export interface Round {
  [bandId: string]: string[];
}

export interface Vote {
  playerId: string;
  bandId: string;
}

export interface Band {
  id: string;
  name: string;
}

interface LobbyState {
  state: GameStates.LOBBY,
  data: null
}

interface RoundState {
  state: GameStates.ROUND;
  data: CurrentRoundVotes
}

export type RejoinableState = LobbyState | RoundState

export interface CurrentRoundVotes {
  [bandId: string]: {
    name: string;
    votes: string[];
  };
}

export interface Game {
  gameState: GameStates;
  winnerName: string;
  currentRound: CurrentRoundVotes;
  playerNames: Set<string>;
}

export enum GameStates {
  LOBBY,
  ROUND,
  ROUND_END,
  GAME_END,
}

const game = ref<Game>({
  gameState: GameStates.LOBBY,
  winnerName: "",
  currentRound: {} as CurrentRoundVotes,
  playerNames: new Set<string>(),
});

export const useGame = () => {
  return {
    game,
    updatePlayers(players: string[]) {
      for (const player of players) {
        game.value.playerNames = game.value.playerNames.add(player)
      }
    },
    updateVotes(votes: Round) {
      Object.keys(votes).map(
        (bandId) => (game.value.currentRound[bandId].votes = votes[bandId])
      );
    },
    endRound(winner: string) {
      game.value.winnerName = winner;
      game.value.gameState = GameStates.ROUND_END;
    },
    endGame(winner: string) {
      game.value.winnerName = winner;
      game.value.gameState = GameStates.GAME_END;
    },
    reconnect(currentRoundState: CurrentRoundVotes) {
      game.value.gameState = GameStates.ROUND
      game.value.currentRound = currentRoundState;
    },
    startRound([band1, band2]: [Band, Band]) {
      game.value.gameState = GameStates.ROUND;
      game.value.currentRound = {
        [band1.id]: {
          name: band1.name,
          votes: [],
        },
        [band2.id]: {
          name: band2.name,
          votes: [],
        },
      };
    },
  };
};
