import { GameState, PlayerState } from '@/game/server/ServerLobby.ts';
import { ThingTuple, VotesTuple } from '@/game/server/Votes.ts';

export type ServerMessage =
  | { type: 'createLobbyResponse'; data: string }
  | { type: 'joinLobbyResponse'; data: JoinLobbyResp }
  | { type: 'allPlayers'; data: AllPlayersMsg }
  | { type: 'allVotes'; data: AllVotesMsg }
  | { type: 'allSuggestions'; data: AllSuggestionsMsg }
  | { type: 'playerJoined'; data: PlayerJoinedMsg }
  | { type: 'playerReady'; data: string }
  | { type: 'playerLeft'; data: string }
  | { type: 'playerReturnedToLobby'; data: string }
  | { type: 'newLobby'; data: string }
  | { type: 'newVote'; data: VoteMsg }
  | { type: 'newSuggestion'; data: string }
  | { type: 'roundStart'; data: RoundStartMsg }
  | { type: 'roundEnd'; data: RoundEndMsg }
  | { type: 'gameInfo'; data: GameInfoMsg }
  | { type: 'gameStart'; data: null };

export type AllPlayersMsg = {
  name: string;
  state: PlayerState;
}[];

export type JoinLobbyResp = {
  uniqueName: string;
  lobbyCode: string;
  stage: GameState['stage'];
} | null;

export type AllSuggestionsMsg = string[];

export type AllVotesMsg = {
  things: ThingTuple;
  votes: VotesTuple;
};

export type GameInfoMsg = {
  uniqueName: string;
  stage: GameState['stage'];
};

export type RoundStartMsg = {
  things: [string, string];
  round: number;
};

export type RoundEndMsg = {
  winner: string;
  gameEnd: boolean;
};

export type VoteMsg = {
  player: string;
  thing: string;
};

export type PlayerJoinedMsg = {
  name: string;
  state: PlayerState;
};
