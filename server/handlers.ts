import { Game } from '@/game.ts';
import { Message } from '@/messages.ts';
import { ConnectionManager } from '@/ConnectionManager.ts';
import { Vote } from '@/game.ts';

export class HandlerFactory {
  #connections: ConnectionManager;
  #game: Game;

  constructor(conns: ConnectionManager, game: Game) {
    this.#connections = conns;
    this.#game = game;
  }

  newPlayer(playerName: string) {
    this.#game.addPlayer(playerName);
    this.#connections.send('BROADCAST', Message.updateLobby, [playerName]);
  }

  newBand(bandName: string) {
    this.#game.addBand(bandName);
    this.#connections.send('BROADCAST', Message.updateBands, [bandName]);
  }

  vote(voteData: Vote) {
    const [isRoundEnd, isGameEnd] = this.#game.vote(voteData);

    if (!isRoundEnd) {
      return this.#connections.send('BROADCAST', Message.updateVotes, this.#game.getVotes());
    }

    const winner = this.#game.getWinner();

    if (!isGameEnd) {
      this.#connections.send('BROADCAST', Message.roundEnd, winner!);

      // start new round after 5s
      setTimeout(() => {
        this.#connections.send('BROADCAST', Message.roundStart, this.#game.startRound());
      }, 5000);
      return;
    }

    this.#connections.send('BROADCAST', Message.gameEnd, winner!);
  }
}
