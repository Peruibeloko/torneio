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

export type RejoinableState =
  | {
      state: GameStates.LOBBY;
      data: null;
    }
  | {
      state: GameStates.ROUND;
      data: CurrentRoundVotes;
    };
