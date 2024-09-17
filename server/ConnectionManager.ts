import { WSContext } from "hono/ws";
import { MessageOut } from "@/messages.ts";

export class ConnectionManager {
  #connections: WSContext[] = [];

  constructor() {}

  private unicast(socket: WSContext, msg: MessageOut) {
    socket.send(JSON.stringify(msg));
  }

  private broadcast(msg: MessageOut) {
    this.#connections
      .filter((conn) => conn.readyState === WebSocket.OPEN)
      .map((conn) => conn.send(JSON.stringify(msg)));
  }

  send<T>(
    audience: "UNICAST",
    builder: (data: T) => MessageOut,
    data: T,
    socket: WSContext
  ): void;
  send<T>(
    audience: "BROADCAST",
    builder: (data: T) => MessageOut,
    data: T
  ): void;
  send<T>(
    audience: "BROADCAST" | "UNICAST",
    builder: (data: T) => MessageOut,
    data: T,
    socket?: WSContext
  ): void {
    audience === "BROADCAST"
      ? this.broadcast(builder(data))
      : this.unicast(socket!, builder(data));
  }

  addConnection(conn: WSContext) {
    this.#connections.push(conn);
  }
}
