import { useGameInternalStore } from '@/client/stores/internal.ts';
import { useVoteStore } from '@/client/stores/votes.ts';
import { ClientEventBus } from '@/game/client/ClientEventBus.ts';
import { ClientMessage } from '@/game/client/ClientMessages.ts';
import { ClientEvents, Handlers } from '@/game/events/ClientEvents.ts';
import { ManagedSocket } from '@/game/events/ManagedSocket.ts';
import type { ServerMessage } from '@/game/server/ServerMessages.ts';
import { useRouter } from 'vue-router';
import { EventType } from '@/game/events/ClientEvents.ts';

export class GameClient {
  #socket: ManagedSocket<ServerMessage, ClientMessage>;
  #game = useGameInternalStore();
  #votes = useVoteStore();
  #router = useRouter();

  constructor() {
    this.#socket = new ManagedSocket('/game', {
      onMessage: this.#handleMsg,
      onOpen: socket =>
        console.info(
          'connected successfully -- url is %s, status is %d',
          socket.url,
          socket.readyState
        )
    });
    this.#game.client = this;
    this.#setupEvents();
  }

  #handleMsg(msg: ServerMessage) {
    console.debug('[GameClient class] Got message', msg);
    ClientEventBus.instance().publish(
      msg.type,
      msg.data as ClientEvents[typeof msg.type]
    );
  }

  #setupEvents() {
    type Key = string | number | symbol;
    const setter =
      <K extends Key, V>(variable: Record<K, V>, field: K) =>
      (value: V) => {
        variable[field] = value;
      };

    const bus = ClientEventBus.instance();

    // prettier-ignore
    const handlers: Partial<Handlers> = {
      createLobbyResponse:   setter(this.#game, 'lobbyCode'),
      allPlayers:            setter(this.#game, 'players'),
      allSuggestions:        setter(this.#game, 'things'),
      newVote:               this.#votes.vote,
      newSuggestion:         (thing) => this.#game.things.unshift(thing),
      playerJoined:          (player) => this.#game.players.push(player),
      joinLobbyResponse:     this.#joinedLobby,
      allVotes:              this.#setVotes,
      playerReady:           this.#playerReady,
      playerLeft:            this.#playerLeft,
      playerReturnedToLobby: this.#playerReturnedToLobby,
      roundStart:            this.#startRound,
      roundEnd:              this.#endRound,
      gameStart:             this.#startGame
    };

    for (const key in handlers) {
      const topic = key as EventType;
      bus.subscribe(topic, (handlers as Handlers)[topic].bind(this));
    }
  }

  createLobby() {
    this.#socket.send({ type: 'create', data: null });
  }

  joinLobby(plainName: string, lobbyCode: string) {
    this.#socket.send({ type: 'join', data: { lobbyCode, player: plainName } });
  }

  #joinedLobby(info: ClientEvents['joinLobbyResponse']) {
    if (!info) return;
    this.#game.lobbyCode = info.lobbyCode;
    this.#game.playerName = info.uniqueName;
    if (info.stage === 'lobby') return this.#router.push({ name: 'lobby' });
    this.#router.push({ name: 'game' });
  }

  returnToLobby() {
    this.#socket.send({
      type: 'returnLobby',
      data: {
        lobbyCode: this.#game.lobbyCode,
        player: this.#game.playerName
      }
    });
    this.#router.push({ name: 'lobby' });
  }

  leaveLobby() {
    this.#socket.send({
      type: 'leave',
      data: { lobbyCode: this.#game.lobbyCode, player: this.#game.playerName }
    });
    this.#clearState();
    this.#router.push({ name: 'home' });
  }

  suggest(thing: string) {
    this.#socket.send({
      type: 'suggest',
      data: { thing, lobbyCode: this.#game.lobbyCode }
    });
  }

  ready() {
    this.#socket.send({
      type: 'ready',
      data: {
        lobbyCode: this.#game.lobbyCode,
        player: this.#game.playerName
      }
    });
  }

  vote(thing: string) {
    this.#votes.vote({ thing, player: this.#game.playerName });
    this.#socket.send({
      type: 'vote',
      data: {
        player: this.#game.playerName,
        thing,
        lobbyCode: this.#game.lobbyCode
      }
    });
  }

  #startGame() {
    for (const p of this.#game.players) {
      p.state = 'inGame';
    }

    // TODO countdown
    this.#router.push({ name: 'game' });
  }

  #startRound({ things, round }: ClientEvents['roundStart']) {
    this.#game.round = round;

    this.#votes.$reset();
    this.#votes.setThings(things);
  }

  #endRound({ winner, gameEnd }: ClientEvents['roundEnd']) {
    this.#game.winner = winner;
    this.#game.isGameEnd = gameEnd;
  }

  #playerReady(name: string) {
    const idx = this.#game.players.findIndex(p => p.name === name);
    if (idx === -1) return;
    this.#game.players[idx].state = 'ready';
  }

  #playerLeft(name: string) {
    const idx = this.#game.players.findIndex(p => p.name === name);
    if (idx === -1) return;
    this.#game.players.splice(idx, 1);
    this.#votes.removePlayer(name);
  }

  #playerReturnedToLobby(name: string) {
    const idx = this.#game.players.findIndex(p => p.name === name);
    if (idx === -1) return;
    this.#game.players[idx].state = 'notReady';
  }

  #setVotes({ things, votes }: ClientEvents['allVotes']) {
    this.#votes.setThings(things);
    this.#votes.setVotes(votes);
  }

  #clearState() {
    this.#game.$reset();
    this.#votes.$reset();
  }
}
