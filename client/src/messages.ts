import { Band, RejoinableState, Vote } from "./composables/game";

export interface UpdateVotes {
  [bandId: string]: string[];
}

export type MessageOut =
  | { type: "vote"; data: Vote }
  | { type: "enterLobby"; data: string | null }
  | { type: "getBands"; data: null }
  | { type: "getPlayers"; data: null }
  | { type: "startGame"; data: null }
  | { type: "reset"; data: null }
  | { type: "reconnectRequest"; data: string };

export type MessageIn =
  | { type: "updateLobby"; data: string[] }
  | { type: "updateBands"; data: string[] }
  | { type: "updateVotes"; data: UpdateVotes }
  | { type: "roundStart"; data: [Band, Band] }
  | { type: "roundEnd"; data: string }
  | { type: "gameEnd"; data: string }
  | { type: "reconnectResponse"; data: RejoinableState };

export const Messages = {
  getBands: (): MessageOut => ({
    type: "getBands",
    data: null,
  }),

  getPlayers: (): MessageOut => ({
    type: "getPlayers",
    data: null,
  }),

  enterLobby: (bandName: string): MessageOut => ({
    type: "enterLobby",
    data: bandName,
  }),

  vote: (playerId: string, bandId: string): MessageOut => ({
    type: "vote",
    data: { playerId, bandId },
  }),

  reconnectRequest: (playerId: string): MessageOut => ({
    type: 'reconnectRequest',
    data: playerId
  })
};
