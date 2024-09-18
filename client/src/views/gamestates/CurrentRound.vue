<template>
  <main>
    <div class="buttons">
      <button :disabled="hasVoted" @click="() => vote(band1Id)">
        {{ bands[band1Id].name }}
      </button>
      <span>OU</span>
      <button :disabled="hasVoted" @click="() => vote(band2Id)">
        {{ bands[band2Id].name }}
      </button>
    </div>
    <div class="votes">
      <ul>
        <li v-for="vote in bands[band1Id].votes">{{ vote }}</li>
      </ul>
      <ul>
        <li v-for="vote in bands[band2Id].votes">{{ vote }}</li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { inject, ref, toValue } from "vue";
import { Game } from "../../composables/game";
import { useSocket } from "../../composables/socket";
import { Messages } from "../../messages";

const hasVoted = ref(false);
const { bands } = defineProps<{ bands: Game["currentRound"] }>();
const [band1Id, band2Id] = Object.keys(bands);
const socket = toValue(inject("socket")) as WebSocket;
const playerId = localStorage.getItem('playerId')!;

const { send } = useSocket(socket, (msg) => {
  switch (msg.type) {
    case "roundStart":
      hasVoted.value = false;
      break;

    default:
      break;
  }
});

const vote = (bandId: string) => {
  hasVoted.value = true;
  send(Messages.vote(playerId, bandId));
};
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  
  height: 70%;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

button {
  width: 15rem;
  min-height: 5rem;
  font-family: "Inter";
  font-size: 1.5rem;
}

ul {
  list-style: none;
}

div.buttons {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 2rem;

  span {
    font-family: 'Bebas Neue';
    font-size: 2rem;
  }
}

div.votes {
  display: flex;
  width: 100%;
  justify-content: space-between;

  ul {
    width: 15rem;
    text-align: center;

    li {
      animation: 200ms fadein 1 forwards;
    }
  }
}
</style>
