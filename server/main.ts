import { Game } from '@/game.ts';
import { ConnectionManager } from '@/ConnectionManager.ts';
import { HandlerFactory } from '@/handlers.ts';
import { Message } from '@/messages.ts';
import { ClientMessage } from "shared/Message.ts";

import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { WSContext } from 'hono/ws';

const game = new Game();
const app = new Hono();
const conns = new ConnectionManager();
const handlers = new HandlerFactory(conns, game);

app.use(async (ctx, next) => {
  ctx.header('Access-Control-Allow-Origin', '*');
  await next();
});

app.post('/player', async ctx => {
  const playerName = await ctx.req.text();
  if (game.isPlayer(name)) return ctx.text('', 409);
  const playerId = game.addPlayer(playerName);
  handlers.newPlayer(playerName);
  return ctx.text(playerId, 201);
});

app.get(
  '/ws',
  upgradeWebSocket(() => ({
    onOpen(_, ws) {
      conns.addConnection(ws);
    },
    onMessage(evt, ws) {
      incomingMessage(ws, JSON.parse(evt.data.valueOf() as string));
    }
  }))
);

const incomingMessage = (socket: WSContext, msg: ClientMessage) => {
  switch (msg.type) {
    case 'enterLobby':
      handlers.newBand(msg.data);
      break;

    case 'vote':
      handlers.vote(msg.data);
      break;

    case 'getBands':
      conns.send('UNICAST', Message.updateBands, game.getAllBandNames(), socket);
      break;

    case 'getPlayers':
      conns.send('UNICAST', Message.updateLobby, game.getAllPlayerNames(), socket);
      break;

    case 'startGame':
      conns.send('BROADCAST', Message.roundStart, game.startGame());
      break;

    case 'reset':
      game.reset();
      break;

    case 'reconnectRequest':
      conns.send('UNICAST', Message.reconnectionResponse, game.getCurrentState(), socket);
      break;
  }
};

Deno.serve({ port: 8080 }, app.fetch);
