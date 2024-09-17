import { onMounted, onUnmounted } from "vue";
import { ServerMessage, ClientMessage } from "../../../shared/Message";

export const useSocket = (
  socket: WebSocket,
  onMessage?: (msg: ServerMessage) => unknown
) => {
  const send = (msg: ClientMessage) => {
    socket.send(JSON.stringify(msg));
  };

  const close = () => {
    socket.close();
  };

  if (onMessage) {
    const handler = (ev: WebSocketEventMap["message"]) =>
      onMessage(JSON.parse(ev.data));
    onMounted(() => socket.addEventListener("message", handler));
    onUnmounted(() => socket.removeEventListener("message", handler));
  }

  return {
    send,
    close,
  };
};
