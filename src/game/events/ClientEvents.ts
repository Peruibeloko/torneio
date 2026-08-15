import { GameState } from '@/game/server/ServerLobby.ts';
import { ThingTuple, VotesTuple } from '@/game/server/Votes.ts';
import { PlayerState } from "@/client/stores/internal.ts";

export type ClientEvents = {
  createLobbyResponse: LobbyCreatedEvt;
  joinLobbyResponse: LobbyJoinedEvt;
  allPlayers: AllPlayersEvt;
  allVotes: AllVotesEvt;
  allSuggestions: AllSuggestionsEvt;
  playerJoined: PlayerJoinedEvt;
  playerReady: PlayerReadyEvt;
  playerLeft: PlayerLeftEvt;
  playerReturnedToLobby: PlayerReturnedEvt;
  newLobby: NewLobbyEvt;
  newVote: VoteEvt;
  newSuggestion: SuggestionEvt;
  roundStart: RoundStartEvt;
  roundEnd: RoundEndEvt;
  gameInfo: GameInfoEvt;
  gameStart: null;
};

type GenericEvent = { [type: string]: unknown };

export type GenericHandlers<E extends GenericEvent> = {
  [T in keyof E]: (data: E[T]) => void;
};

export type EventType = keyof ClientEvents;
export type Handlers = GenericHandlers<ClientEvents>;

// TODO nova operação única: sync player
type LobbyCreatedEvt = string;
type LobbyJoinedEvt = GameInfo | null;
type AllPlayersEvt = { name: string; state: PlayerState }[];
type AllVotesEvt = { things: ThingTuple; votes: VotesTuple };
type AllSuggestionsEvt = string[];
type PlayerJoinedEvt = { name: string; state: PlayerState };
type PlayerReadyEvt = string;
type PlayerLeftEvt = string;
type PlayerReturnedEvt = string;
type NewLobbyEvt = null;
type VoteEvt = { player: string; thing: string };
type SuggestionEvt = string;
type RoundStartEvt = { things: ThingTuple; round: number };
type RoundEndEvt = { winner: string; gameEnd: boolean };
type GameInfoEvt = { stage: GameState['stage'] };

interface GameInfo {
  lobbyCode: string;
  uniqueName: string;
  stage: GameState['stage'];
}