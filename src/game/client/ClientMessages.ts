// prettier-ignore
export type ClientMessage =
  | { type: 'create';      data: null }
  | { type: 'join';        data: PlayerMsg }
  | { type: 'returnLobby'; data: PlayerMsg }
  | { type: 'returnHome';  data: PlayerMsg }
  | { type: 'leave';       data: PlayerMsg }
  | { type: 'suggest';     data: SuggestMsg }
  | { type: 'ready';       data: PlayerMsg }
  | { type: 'vote';        data: VoteMsg };

type PlayerMsg = {
  player: string;
  lobbyCode: string;
};

export type SuggestMsg = {
  lobbyCode: string;
  thing: string;
};

export type VoteMsg = {
  lobbyCode: string;
  player: string;
  thing: string;
};
