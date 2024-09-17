import { onMounted, onUnmounted } from "vue";
import { MessageIn, MessageOut } from "../types";

export const useSocket = (
  socket: WebSocket,
  onMessage?: (msg: MessageIn) => unknown
) => {
  const send = (msg: MessageOut) => {
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
