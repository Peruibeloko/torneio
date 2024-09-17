import { createApp, ref } from "vue";
import './global.css'
import App from "./App.vue";
import router from "./router";

const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/ws`);
url.protocol = import.meta.env.DEV ? "ws" : "wss";
const socket = ref(new WebSocket(url));

///@ts-ignore
window.startGame = () => {
  socket.value.send(
    JSON.stringify({
      type: "startGame",
      data: null,
    })
  );
};

///@ts-ignore
window.reset = () => {
  socket.value.send(
    JSON.stringify({
      type: "reset",
      data: null,
    })
  );
};

createApp(App).provide("socket", socket).use(router).mount("#app");
