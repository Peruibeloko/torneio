import { ClientMessage } from "../../shared/Message";

export interface UpdateVotes {
  [bandId: string]: string[];
}

export const Messages = {
  getBands: (): ClientMessage => ({
    type: "getBands",
    data: null,
  }),

  getPlayers: (): ClientMessage => ({
    type: "getPlayers",
    data: null,
  }),

  enterLobby: (bandName: string): ClientMessage => ({
    type: "enterLobby",
    data: bandName,
  }),

  vote: (playerId: string, bandId: string): ClientMessage => ({
    type: "vote",
    data: { playerId, bandId },
  }),

  reconnectRequest: (playerId: string): ClientMessage => ({
    type: 'reconnectRequest',
    data: playerId
  })
};
