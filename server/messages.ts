import { Round } from '@/game.ts';
import { Vote, Band, RejoinableState, GameStates } from '@/game.ts';

export type MessageIn =
  | { type: 'vote'; data: Vote }
  | { type: 'enterLobby'; data: string }
  | { type: 'getBands'; data: null }
  | { type: 'getPlayers'; data: null }
  | { type: 'startGame'; data: null }
  | { type: 'reset'; data: null }
  | { type: 'reconnectRequest'; data: string };

export type MessageOut =
  | { type: 'updateLobby'; data: string[] }
  | { type: 'updateBands'; data: string[] }
  | { type: 'updateVotes'; data: Round }
  | { type: 'roundStart'; data: [Band, Band] }
  | { type: 'roundEnd'; data: string }
  | { type: 'gameEnd'; data: string }
  | { type: 'reconnectResponse'; data: RejoinableState };

export const Message = {
  updateLobby: (players: string[]): MessageOut => ({
    type: 'updateLobby',
    data: players
  }),

  updateBands: (bands: string[]): MessageOut => ({
    type: 'updateBands',
    data: bands
  }),

  updateVotes: (votesUpdate: Round): MessageOut => ({
    type: 'updateVotes',
    data: votesUpdate
  }),

  roundStart: (bands: [Band, Band]): MessageOut => ({
    type: 'roundStart',
    data: bands
  }),

  roundEnd: (winner: string): MessageOut => ({
    type: 'roundEnd',
    data: winner
  }),

  gameEnd: (winner: string): MessageOut => ({
    type: 'gameEnd',
    data: winner
  }),

  reconnectionResponse: ({ state, gameData }: RejoinableState): MessageOut => ({
    type: 'reconnectResponse',
    data: state === GameStates.LOBBY ? { state, gameData } : { state, gameData }
  })
};
