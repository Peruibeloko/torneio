import { Round, Band, RejoinableState, GameStates } from 'shared/Game.ts';
import { ServerMessage } from 'shared/Message.ts';

export const Message = {
  updateLobby: (players: string[]): ServerMessage => ({
    type: 'updateLobby',
    data: players
  }),

  updateBands: (bands: string[]): ServerMessage => ({
    type: 'updateBands',
    data: bands
  }),

  updateVotes: (votesUpdate: Round): ServerMessage => ({
    type: 'updateVotes',
    data: votesUpdate
  }),

  roundStart: (bands: [Band, Band]): ServerMessage => ({
    type: 'roundStart',
    data: bands
  }),

  roundEnd: (winner: string): ServerMessage => ({
    type: 'roundEnd',
    data: winner
  }),

  gameEnd: (winner: string): ServerMessage => ({
    type: 'gameEnd',
    data: winner
  }),

  reconnectionResponse: ({ state, data }: RejoinableState): ServerMessage => ({
    type: 'reconnectResponse',
    data: state === GameStates.LOBBY ? { state, data } : { state, data }
  })
};
