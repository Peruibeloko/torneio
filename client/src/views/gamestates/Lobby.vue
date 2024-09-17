<template>
  <main>
    <h2>Aguardando início do jogo:</h2>
    <ul>
      <li v-for="player in players">{{ player }}</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { toValue, inject, onMounted } from "vue";
import { Game } from "../../composables/game";
import { useSocket } from "../../composables/socket";
import { Messages } from "../../messages";

defineProps<{ players: Game["playerNames"] }>();

const socket = toValue(inject("socket")) as WebSocket;
const { send } = useSocket(socket);
onMounted(() => send(Messages.getPlayers()));
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

h2 {
  margin-top: 3rem;
  font-size: 1.5rem;
  font-family: "Inter";
}

ul {
  font-size: 1.5rem;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;

  li {
    animation: 200ms fadein 1 forwards;
  }
}
</style>
