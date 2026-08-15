import { useGameInternalStore } from '@/client/stores/internal.ts';
import { useVoteStore } from '@/client/stores/votes.ts';
import { ClientEventBus } from '@/game/client/ClientEventBus.ts';
import { ClientMessage } from '@/game/client/ClientMessages.ts';
import { ClientEvents } from '@/game/events/ClientEvents.ts';
import { ManagedSocket } from '@/game/events/ManagedSocket.ts';
import type { ServerMessage } from '@/game/server/ServerMessages.ts';

export class GameClient {
  #socket: ManagedSocket<ServerMessage, ClientMessage>;
  #game = useGameInternalStore();
  #votes = useVoteStore();

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

  #setupEvents() {
    ClientEventBus.instance().subscribe('createLobbyResponse', lobbyCode => {
      this.#game.lobbyCode = lobbyCode;
    });

    ClientEventBus.instance().subscribe('joinLobbyResponse', info => {
      if (!info) return;
      this.#game.lobbyCode = info.lobbyCode;
      this.#game.playerName = info.uniqueName;
    });

    ClientEventBus.instance().subscribe('allPlayers', players => {
      this.#game.players = players;
    });

    ClientEventBus.instance().subscribe('allVotes', this.#setVotes.bind(this));

    ClientEventBus.instance().subscribe('allSuggestions', things => {
      this.#game.things = things;
    });

    ClientEventBus.instance().subscribe('playerJoined', ({ name, state }) =>
      this.#game.players.push({ name, state })
    );

    ClientEventBus.instance().subscribe(
      'playerReady',
      this.#playerReady.bind(this)
    );

    ClientEventBus.instance().subscribe(
      'playerLeft',
      this.#playerLeft.bind(this)
    );

    ClientEventBus.instance().subscribe(
      'playerReturnedToLobby',
      this.#playerReturnedToLobby.bind(this)
    );

    ClientEventBus.instance().subscribe('newVote', ({ player, thing }) =>
      this.#votes.vote(thing, player)
    );

    ClientEventBus.instance().subscribe('newSuggestion', thing =>
      this.#game.things.unshift(thing)
    );

    ClientEventBus.instance().subscribe('gameStart', () => {
      for (const p of this.#game.players) {
        p.state = 'inGame';
      }
    });

    ClientEventBus.instance().subscribe(
      'roundStart',
      this.#startRound.bind(this)
    );

    ClientEventBus.instance().subscribe('roundEnd', this.#endRound.bind(this));
  }

  createLobby() {
    this.#socket.send({
      type: 'create',
      data: null
    });
  }

  joinLobby(plainName: string, lobbyCode: string) {
    this.#socket.send({
      type: 'join',
      data: { lobbyCode, player: plainName }
    });
  }

  returnToLobby() {
    this.#socket.send({
      type: 'returnLobby',
      data: {
        lobbyCode: this.#game.lobbyCode,
        player: this.#game.playerName
      }
    });
  }

  leaveLobby() {
    this.#socket.send({
      type: 'leave',
      data: { lobbyCode: this.#game.lobbyCode, player: this.#game.playerName }
    });
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
    this.#votes.vote(thing, this.#game.playerName);
    this.#socket.send({
      type: 'vote',
      data: {
        player: this.#game.playerName,
        thing,
        lobbyCode: this.#game.lobbyCode
      }
    });
  }

  #startRound({ things, round }: ClientEvents['roundStart']) {
    this.#game.round = round;

    this.#votes.reset();
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

  #handleMsg(msg: ServerMessage) {
    console.debug('[GameClient class] Got message', msg);
    ClientEventBus.instance().publish(
      msg.type,
      msg.data as ClientEvents[typeof msg.type]
    );
  }
}
