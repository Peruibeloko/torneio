<template>
  <div class="background"></div>
  <header>
    <h1>Torneio das Bandas</h1>
  </header>
  <RouterView />
  <footer class="spacer"></footer>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, toValue } from "vue";
import { useSocket } from "./composables/socket";
import { useRoute } from "vue-router";
import router, { RouteNames } from "./router";
import { Messages } from "./messages";
import { GameStates, useGame } from "./composables/game";

const socket = toValue(inject("socket")) as WebSocket;
const { reconnect } = useGame();

const { close, send } = useSocket(socket, (msg) => {
  switch (msg.type) {
    case 'reconnectResponse':
      if (msg.data.state === GameStates.LOBBY) {
        router.push('/play')
        break;
      }
      
      if (msg.data.state === GameStates.ROUND) {
        reconnect(msg.data)        
        router.push('/play')
      }
      break;
  
    default:
      break;
  }
});
const currentRoute = useRoute();

onBeforeUnmount(close);
onMounted(() => {
  const playerId = localStorage.getItem('userId');
  if(playerId && currentRoute.name === RouteNames.LOGIN) {
    send(Messages.reconnectRequest(playerId))
  }
})

</script>

<style scoped>
h1 {
  font-family: "Bebas Neue";
  font-size: 3rem;
  filter: drop-shadow(0px 3px 0px var(--red)); 
}

header {
  margin-top: 2rem;
}

.spacer {
  position: relative;
  height: 92px;
  width: 100%;
}

div.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: invert() brightness(0.2) opacity(0.2);
  background-image: url("https://em-content.zobj.net/source/noto-emoji/377/guitar_1f3b8.jpg");
  background-repeat: repeat;
  background-blend-mode: lighten;
  background-size: 4rem;
  animation: marquee 4s linear infinite forwards;
}

@keyframes marquee {
  from {
    background-position: 0rem 0rem;
  }

  to {
    background-position: -4rem 4rem;
  }
}
</style>
