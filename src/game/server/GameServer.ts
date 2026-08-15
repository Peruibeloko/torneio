import type { ClientMessage } from '@/game/client/ClientMessages.ts';
import { ServerEvents } from '@/game/events/ServerEvents.ts';
import { ServerLobby } from '@/game/server/ServerLobby.ts';
import type { ServerMessage } from '@/game/server/ServerMessages.ts';
import { encode } from 'msgpack';

export class GameServer {
  #lobbies = new Map<string, ServerLobby>();

  constructor() {}

  getLobby(lobbyCode: string) {
    return this.#lobbies.get(lobbyCode) ?? null;
  }

  createLobby(socket: WebSocket) {
    let lobbyCode = ServerLobby.generateRoomCode();
    while (this.#lobbies.has(lobbyCode)) {
      lobbyCode = ServerLobby.generateRoomCode();
    }

    this.#lobbies.set(lobbyCode, new ServerLobby(lobbyCode));
    this.sendMsg({ type: 'createLobbyResponse', data: lobbyCode }, socket);
  }

  joinLobby(msg: ServerEvents['join']) {
    const { lobbyCode, player, socket } = msg;
    const lobby = this.getLobby(lobbyCode.toUpperCase());

    if (lobby === null) {
      this.sendMsg({ type: 'joinLobbyResponse', data: null }, socket);
      return;
    }

    const uniqueName = lobby.getUniqueName(player);
    lobby.addPlayer(uniqueName, socket);
    console.log('[%s] Player %s joined', lobbyCode, uniqueName);

    socket.addEventListener('close', () => {
      lobby.removePlayer(uniqueName);
      this.playerLeft(lobbyCode);
    });

    this.sendMsg(
      {
        type: 'joinLobbyResponse',
        data: {
          stage: lobby.stage,
          lobbyCode: lobby.code,
          uniqueName: uniqueName
        }
      },
      socket
    );
  }

  playerLeft(lobbyCode: string) {
    const lobby = this.getLobby(lobbyCode);
    if (lobby && lobby.size === 0) {
      this.#lobbies.delete(lobbyCode);
    }
  }

  sendMsg(msg: ServerMessage, socket: WebSocket) {
    console.debug('[GameServer class] Sending message %o', msg);
    socket.send(encode(msg));
  }

  handleMsg(msg: ClientMessage, socket: WebSocket) {
    console.debug('[GameServer class] Got message', msg);

    switch (msg.type) {
      case 'create':
        this.createLobby(socket);
        break;
      case 'join':
        this.joinLobby({ ...msg.data, socket });
        break;
    }

    if (msg.data?.lobbyCode) {
      this.getLobby(msg.data.lobbyCode)?.handleMsg(msg, socket);
    }
  }
}
