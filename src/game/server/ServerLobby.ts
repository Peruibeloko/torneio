import { ServerEvents } from '@/game/events/ServerEvents.ts';
import type { ServerMessage } from '@/game/server/ServerMessages.ts';
import { Tournament } from '@/game/server/Tournament.ts';
import { Votes } from '@/game/server/Votes.ts';
import { encode } from 'msgpack';
import { ClientMessage } from '@/game/client/ClientMessages.ts';

export type PlayerState = 'notReady' | 'ready' | 'inGame';

type ServerPlayer = {
  state: PlayerState;
  socket: WebSocket;
};

export type GameState =
  | { stage: 'lobby'; remainingReady: number }
  | { stage: 'roundEnd'; round: number; winner: string; gameEnd: boolean }
  | {
      stage: 'game';
      round: number;
      totalVotes: number;
      votes: Votes;
    };

export class ServerLobby {
  #lobbyCode: string; // telemetria
  #players = new Map<string, ServerPlayer>();
  #state: GameState;
  #tournament = new Tournament();
  #things: Set<string>;

  constructor(lobbyCode: string) {
    this.#lobbyCode = lobbyCode;
    this.#things = new Set<string>();
    this.#state = {
      stage: 'lobby',
      remainingReady: 0
    };
  }

  get stage() {
    return this.#state.stage;
  }

  get code() {
    return this.#lobbyCode;
  }

  get size() {
    return this.#players.size;
  }

  handleMsg(msg: ClientMessage, socket: WebSocket) {
    switch (msg.type) {
      case 'ready':
        this.playerReady({ ...msg.data, socket });
        break;
      case 'returnLobby':
        this.playerReturnedToLobby({ ...msg.data, socket });
        break;
      case 'leave':
        this.removePlayer(msg.data.player);
        break;
      case 'suggest':
        this.suggestThing({ ...msg.data, socket });
        break;
      case 'vote':
        this.voteFor({ ...msg.data, socket });
        break;
    }
  }

  #sendMsg(msg: ServerMessage, socket: WebSocket) {
    console.debug('[%s] Sending message %o', this.#lobbyCode, msg);
    socket.send(encode(msg));
  }

  #shoutMsg(msg: ServerMessage) {
    console.debug('[%s] Broadcasting message %o', this.#lobbyCode, msg);
    for (const { socket } of this.#players.values()) socket.send(encode(msg));
  }

  static generateRoomCode() {
    const randomIntBetween = (min: number, max: number) => {
      const minCeiled = Math.ceil(min);
      const maxFloored = Math.floor(max);
      return Math.floor(
        Math.random() * (maxFloored - minCeiled + 1) + minCeiled
      );
    };

    // A - Z in ASCII
    const getRandomChar = () => randomIntBetween(65, 90);

    const codes = new Array(6)
      .fill(0) // map doesnt work on empty arrays
      .map(getRandomChar);

    return String.fromCodePoint(...codes);
  }

  getUniqueName(name: string) {
    const createPlayerCode = () => {
      const randomInt = () => Math.ceil(Math.random() * 9);
      const code = new Array(4).fill(0).map(randomInt);
      return code.join('');
    };

    let uniqueName = name + '#' + createPlayerCode();
    while (this.#players.has(uniqueName)) {
      uniqueName = name + '#' + createPlayerCode();
    }

    return uniqueName;
  }

  addPlayer(player: string, socket: WebSocket) {
    const choosePlayerState = (): PlayerState => {
      switch (this.#state.stage) {
        case 'lobby':
          return 'notReady';
        case 'roundEnd':
        case 'game':
          return 'inGame';
      }
    };

    this.#shoutMsg({
      type: 'playerJoined',
      data: { name: player, state: choosePlayerState() }
    });

    this.#players.set(player, { state: choosePlayerState(), socket });

    if (this.#state.stage === 'lobby') this.#state.remainingReady++;
    this.#syncPlayer(socket);
  }

  playerReturnedToLobby({ player, socket }: ServerEvents['returnLobby']) {
    console.log('[%s] Player %s returned to lobby', this.#lobbyCode, player);
    if (this.#state.stage === 'roundEnd') {
      (this.#state.stage as string) = 'lobby';
      this.#resetLobby();
    }
    this.#shoutMsg({ type: 'playerReturnedToLobby', data: player });
    this.#players.set(player, { state: 'notReady', socket });
  }

  #resetLobby() {
    if (this.#state.stage !== 'lobby') return;
    this.#state.remainingReady = this.#players.size;
    this.#tournament.setup(this.#things);
  }

  #syncPlayer(socket: WebSocket) {
    switch (this.#state.stage) {
      case 'lobby':
        {
          this.#sendMsg(
            {
              type: 'allPlayers',
              data: this.#players
                .entries()
                .map(([name, p]) => ({
                  name,
                  state: p.state
                }))
                .toArray()
            },
            socket
          );

          this.#sendMsg(
            {
              type: 'allSuggestions',
              data: this.#things.values().toArray()
            },
            socket
          );
        }
        break;

      case 'game':
        {
          this.#sendMsg(
            {
              type: 'allVotes',
              data: {
                things: this.#state.votes.thingsTuple(),
                votes: this.#state.votes.votesTuple()
              }
            },
            socket
          );
        }
        break;

      case 'roundEnd': {
        this.#sendMsg(
          {
            type: 'roundEnd',
            data: { gameEnd: this.#state.gameEnd, winner: this.#state.winner }
          },
          socket
        );
      }
    }
  }

  removePlayer(player: string) {
    this.#players.delete(player);
    if (this.#players.size === 0) return;

    this.#shoutMsg({ type: 'playerLeft', data: player });

    if (this.#state.stage === 'game') {
      this.#state.totalVotes = this.#state.votes.removePlayer(player);

      if (this.#state.totalVotes === this.#players.size) this.endRound();
    }

    return this.#players.size;
  }

  suggestThing({ thing }: ServerEvents['suggest']) {
    if (this.#state.stage !== 'lobby') return;
    this.#shoutMsg({ type: 'newSuggestion', data: thing });
    this.#things.add(thing);
  }

  playerReady({ player }: ServerEvents['ready']) {
    if (this.#state.stage !== 'lobby') return;

    this.#shoutMsg({ type: 'playerReady', data: player });

    const playerData = this.#players.get(player);
    if (!playerData) return;
    
    this.#players.set(player, { ...playerData, state: 'ready'});

    this.#state.remainingReady -= 1;
    
    console.log(
      '%d ready, %d remaining',
      this.#players.size - this.#state.remainingReady,
      this.#state.remainingReady
    );

    if (this.#state.remainingReady === 0) this.startGame();
  }

  voteFor({ thing, player }: ServerEvents['vote']) {
    if (this.#state.stage !== 'game') return;

    console.log('[%s] Player %s voted for %s', this.#lobbyCode, player, thing);

    this.#state.totalVotes = this.#state.votes.vote(thing, player);

    this.#shoutMsg({
      type: 'newVote',
      data: { player, thing }
    });

    if (this.#state.totalVotes === this.#players.size) this.endRound();
  }

  startGame() {
    if (this.#state.stage !== 'lobby') return;
    console.log('[%s] Starting game', this.#lobbyCode);
    this.#tournament.setup(this.#things);
    
    for (const [playerName, player] of this.#players) {
      this.#players.set(playerName, { ...player, state: 'inGame' });
    }    
    
    this.#shoutMsg({ type: 'gameStart', data: null });
    this.startRound();
  }

  startRound() {
    if (this.#state.stage === 'game') return;

    const things = this.#tournament.getNextMatch();

    console.log(
      '[%s] Starting round no. %d with %s',
      this.#tournament.currentRound,
      things
    );

    this.#state = {
      stage: 'game',
      totalVotes: 0,
      round: this.#tournament.currentRound,
      votes: Votes.getInstance()
    };

    this.#state.votes.startRound(things);

    this.#shoutMsg({
      type: 'roundStart',
      data: { round: this.#state.round, things }
    });
  }

  endRound() {
    if (this.#state.stage !== 'game') return;

    const winner = this.#tournament.handleMatchEnd([
      this.#state.votes.thingsTuple(),
      this.#state.votes.voteCount()
    ]);

    const round = this.#state.round;
    const gameEnd = this.#tournament.isTournamentDone;
    const winnerMsg = winner ?? 'Empate!';

    console.log(
      '[%s] Round no. %d ended, winner is %s',
      this.#lobbyCode,
      round,
      winner
    );
    if (gameEnd) console.log('[%s] Game end', this.#lobbyCode);

    this.#state = {
      stage: 'roundEnd',
      round,
      winner: winnerMsg,
      gameEnd
    };

    this.#shoutMsg({ type: 'roundEnd', data: { gameEnd, winner: winnerMsg } });
    if (!gameEnd) setTimeout(() => this.startRound(), 1000);
  }
}
