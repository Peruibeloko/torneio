import { chunk } from '@std/collections';
import { Band, GameStates, RejoinableState, Round } from 'shared/Game.ts';

interface CurrentRoundVotes {
  [bandId: string]: {
    name: string;
    votes: string[];
  };
}

export class Game {
  #state = GameStates.LOBBY;

  /**
   * Maps `playerId`s to names
   */
  #players = new Map<string, string>();

  /**
   * Maps `bandId`s to names
   */
  #bands = new Map<string, string>();

  /** Maps `bandId` to an array of player names, which counts as the votes */
  #round: Round = {};

  #voteCount = 0;

  /**
   * List of pairs of `bandId`s representing the tournment structure
   *
   * Works like a Queue (FIFO)
   */
  #tournament: [string, string][] = [];

  /**
   * empty string at round start
   *
   * `bandId` at round/game end
   *
   * `null` for ties
   */
  #winner: string | null = '';

  shuffleArray<T>(arr: T[]) {
    for (let i = 0; i < arr.length - 1; i++) {
      const randomPos = Math.floor(Math.random() * arr.length);
      [arr[i], arr[randomPos]] = [arr[randomPos], arr[i]];
    }
  }

  setupByeRounds(bandIds: string[]) {
    const bandCount = this.#bands.size;

    // next power of 2 bigger than bandCount
    const fullBracket = 2 ** Math.ceil(Math.log2(bandCount));
    const byeCount = fullBracket - bandCount;

    if (byeCount === 0) return [];

    const byes: string[] = [];

    // get <byeCount> random bands
    for (let i = 0; i < byeCount; i++) {
      byes.push(bandIds.pop()!);
    }

    // store <byes/2> pairs into #tournament
    const byeRounds = chunk(byes, 2);

    if (byeRounds.at(-1)?.length === 1) {
      byeRounds.at(-1)?.push('');
    }

    return byeRounds as [string, string][];
  }

  startGame() {
    // shuffle ids
    const bandIds = [...this.#bands.keys()];
    this.shuffleArray(bandIds);

    const byeRounds = this.setupByeRounds(bandIds);
    this.#tournament.push(...byeRounds);

    // store remaining band pairs into #tournament
    while (bandIds.length !== 0) {
      this.#tournament.push([bandIds.pop()!, bandIds.pop()!]);
    }

    return this.startRound();
  }

  startRound(): [Band, Band] {
    this.#winner = '';

    let [bandId1, bandId2] = this.#tournament.pop()!;

    if (bandId2 === '') {
      this.#tournament.unshift([bandId1, bandId2]);

      [bandId1, bandId2] = this.#tournament.pop()!;
    }

    this.#round = {
      [bandId1]: [],
      [bandId2]: []
    };

    this.#state = GameStates.ROUND;
    return [
      {
        id: bandId1,
        name: this.#bands.get(bandId1)!
      },
      {
        id: bandId2,
        name: this.#bands.get(bandId2)!
      }
    ];
  }

  endRound() {
    this.#voteCount = 0;
    const [bandA, bandB] = Object.keys(this.#round);

    // handle ties
    if (this.#round[bandA].length === this.#round[bandB].length) {
      this.#winner = null;
      this.#tournament.push([bandA, bandB]);
      return [true, false, null] as const;
    }

    // decide winner
    this.#winner = this.#round[bandA].length > this.#round[bandB].length ? bandA : bandB;

    const winnerName = this.#bands.get(this.#winner);

    // check if tournament has ended
    if (this.#tournament.length === 0) {
      this.#state = GameStates.GAME_END;
      return [true, true, winnerName] as const;
    }

    // if tournament has a match awaiting a competitor fill it in
    if (this.#tournament[0][1] === '') this.#tournament[0][1] = this.#winner;
    // if not, we create a new match
    else this.#tournament.unshift([this.#winner, '']);

    this.#state = GameStates.ROUND_END;
    return [true, false, winnerName] as const;
  }

  vote({ playerId, bandId }: { playerId: string; bandId: string }) {
    this.#round[bandId].push(this.#players.get(playerId)!);
    this.#voteCount += 1;

    if (this.#voteCount === this.#players.size) return this.endRound();
    return [false, false, null] as const;
  }

  reset() {
    this.#state = GameStates.LOBBY;
    this.#players = new Map<string, string>();
    this.#bands = new Map<string, string>();
    this.#round = {};
    this.#voteCount = 0;
    this.#tournament = [];
    this.#winner = '';
  }

  getCurrentState(): RejoinableState {
    if (this.#state === GameStates.LOBBY) {
      return {
        state: GameStates.LOBBY,
        data: null
      };
    }

    const gameData: CurrentRoundVotes = {};
    for (const bandId in this.#round) {
      gameData[bandId] = {
        name: this.#bands.get(bandId)!,
        votes: this.#round[bandId]
      };
    }

    return {
      state: GameStates.ROUND,
      data: gameData
    };
  }

  getVotes() {
    return this.#round;
  }

  getWinner() {
    if (this.#winner === null) return 'Empate!';
    return this.#bands.get(this.#winner);
  }

  getAllPlayerNames() {
    return [...this.#players.values()];
  }

  getPlayer(id: string) {
    return this.#players.get(id)!;
  }

  addPlayer(playerName: string) {
    const id = crypto.randomUUID();
    this.#players.set(id, playerName);
    return id;
  }

  getBandName(id: string) {
    return this.#bands.get(id)!;
  }

  getAllBandNames() {
    return [...this.#bands.values()];
  }

  addBand(bandName: string) {
    const id = crypto.randomUUID();
    this.#bands.set(id, bandName);
  }

  bandsAsJson() {
    const out: Record<string, string> = {};
    for (const [bandId, bandName] of this.#bands.entries()) {
      out[bandId] = bandName;
    }
    return out;
  }

  isPlayer(playerName: string) {
    for (const player of this.#players.values()) {
      if (playerName === player) return true;
    }
    return false;
  }
}
