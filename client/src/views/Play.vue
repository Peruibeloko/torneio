<template>
  <Lobby :players="game.players" v-if="gameState === GameStates.LOBBY" />
  <CurrentRound :bands="game.bands" v-if="gameState === GameStates.ROUND" />
  <RoundEnd :winner="game.winner" v-if="gameState === GameStates.ROUND_END" />
  <GameEnd :winner="game.winner" v-if="gameState === GameStates.GAME_END" />
</template>

<script setup lang="ts">
import { computed, inject, toValue } from "vue";
import { GameStates } from "../../../shared/Game";
import { useGame } from "../composables/game";
import { useSocket } from "../composables/socket";

import CurrentRound from "./gamestates/CurrentRound.vue";
import GameEnd from "./gamestates/GameEnd.vue";
import Lobby from "./gamestates/Lobby.vue";
import RoundEnd from "./gamestates/RoundEnd.vue";

const socket = toValue(inject("socket")) as WebSocket;
const { game, startRound, endRound, endGame, updatePlayers, updateVotes } =
  useGame();

const gameState = computed(() => game.value.gameState);

useSocket(socket, (msg) => {
  switch (msg.type) {
    case "roundStart":
      startRound(msg.data);
      break;

    case "roundEnd":
      endRound(msg.data);
      break;

    case "gameEnd":
      endGame(msg.data);
      break;

    case "updateLobby":
      updatePlayers(msg.data);
      break;

    case "updateVotes":
      updateVotes(msg.data);
      break;

    default:
      return;
  }
});
</script>
