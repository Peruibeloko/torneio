import { Band, RejoinableState, Round, Vote } from "./Game.ts";

export type ClientMessage =
  | { type: 'vote'; data: Vote }
  | { type: 'enterLobby'; data: string }
  | { type: 'getBands'; data: null }
  | { type: 'getPlayers'; data: null }
  | { type: 'startGame'; data: null }
  | { type: 'reset'; data: null }
  | { type: 'reconnectRequest'; data: string };

export type ServerMessage =
  | { type: 'updateLobby'; data: string[] }
  | { type: 'updateBands'; data: string[] }
  | { type: 'updateVotes'; data: Round }
  | { type: 'roundStart'; data: [Band, Band] }
  | { type: 'roundEnd'; data: string }
  | { type: 'gameEnd'; data: string }
  | { type: 'reconnectResponse'; data: RejoinableState };
