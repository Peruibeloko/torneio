export enum GameStates {
  LOBBY,
  ROUND,
  ROUND_END,
  GAME_END
}

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

export interface CurrentRoundVotes {
  [bandId: string]: {
    name: string;
    votes: string[];
  };
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