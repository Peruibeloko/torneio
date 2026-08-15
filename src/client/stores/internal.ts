import { GameClient } from '@/game/client/GameClient.ts';
import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';

export type PlayerState = 'notReady' | 'ready' | 'inGame';

interface ClientPlayer {
  name: string;
  state: PlayerState;
}

export const useGameInternalStore = defineStore('gameInternal', () => {
  const client = markRaw(new GameClient());

  const playerName = ref('');
  const lobbyCode = ref('');

  const players = ref<ClientPlayer[]>([]);
  const things = ref<string[]>([]);

  const round = ref(1);
  const winner = ref('');
  const isGameEnd = ref(false);

  return {
    client,
    playerName,
    lobbyCode,
    players,
    things,
    round,
    winner,
    isGameEnd
  };
});
