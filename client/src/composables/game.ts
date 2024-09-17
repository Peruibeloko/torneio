import { ref } from "vue";
import { Band, Round, CurrentRoundVotes, GameStates } from "../../../shared/Game";

export interface Game {
  gameState: GameStates;
  players: Set<string>;
  bands: CurrentRoundVotes;
  winner: string;
  currentRound: CurrentRoundVotes;
  playerNames: Set<string>;
}

const game = ref<Game>({
  gameState: GameStates.LOBBY,
  winner: "",
  players: new Set(),
  bands: {},
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
      game.value.winner = winner;
      game.value.gameState = GameStates.ROUND_END;
    },
    endGame(winner: string) {
      game.value.winner = winner;
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
