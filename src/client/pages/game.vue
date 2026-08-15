<template>
  <dialog ref="winnerModal" id="winner">
    <header>
      <span class="left">🎉</span>
      <span class="fancytext_tiny"
        >Vencedor{{ game.gameEnd ? null : ' da rodada' }}
      </span>
      <span>🎉</span>
      </header>
    <h2 class="fancytext_big">{{ game.winner }}</h2>
    <button type="button" v-if="game.gameEnd" @click="backToLobby">
      Voltar ao lobby
    </button>
  </dialog>

  <header>
    <h1 class="fancytext_big">RODADA {{ game.round }}</h1>
    <h2 class="fancytext_tiny">{{ game.lobbyCode }}</h2>
  </header>

  <main>
    <section>
      <span class="fancytext_mid">{{ votes.thingL }}</span>
      <button @click="voteL" :disabled="disabledL">VOTAR</button>
      <ul>
        <li class="fancytext_tiny" v-for="v in votes.votesL" :key="v">
          {{ v }}
        </li>
      </ul>
    </section>
    <section>
      <span class="fancytext_mid">{{ votes.thingR }}</span>
      <button @click="voteR" :disabled="disabledR">VOTAR</button>
      <ul>
        <li class="fancytext_tiny" v-for="v in votes.votesR" :key="v">
          {{ v }}
        </li>
      </ul>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/client/stores/game.ts';
import { useVoteStore } from '@/client/stores/votes.ts';
import { ClientEventBus } from '@/game/client/ClientEventBus.ts';
import { ref, useTemplateRef } from 'vue';
import { router } from '@/client/router.ts';

const game = useGameStore();
const votes = useVoteStore();

const disabledL = ref(false);
const disabledR = ref(false);

const winnerModal = useTemplateRef('winnerModal');

ClientEventBus.instance().subscribe('roundEnd', () => {
  winnerModal.value?.showModal();
});

ClientEventBus.instance().subscribe('roundStart', () => {
  winnerModal.value?.close();
  disabledL.value = false;
  disabledR.value = false;
});

const backToLobby = () => {
  game.client.returnToLobby();
  router.push({ name: 'lobby' });
};

const voteL = () => {
  game.client.vote(votes.thingL);
  disabledL.value = true;
  disabledR.value = false;
};

const voteR = () => {
  game.client.vote(votes.thingR);
  disabledL.value = false;
  disabledR.value = true;
};
</script>

<style src="@/client/assets/game.css" scoped></style>
