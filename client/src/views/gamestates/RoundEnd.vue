<template>
  <main>
    <h3>Vencedor da rodada</h3>
    <h2>{{ winner }}</h2>
    <p>Próxima rodada em {{ countdown }}...</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

defineProps<{ winner: string }>();

const countdownId = ref();
const countdown = ref(5);

watch(countdown, (val) => val === 0 && clearInterval(countdownId.value));

onMounted(() => {
  countdownId.value = setInterval(() => {
    countdown.value--;
  }, 1000);
});
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 60%;
  justify-content: center;
}

h3 {
  margin-top: 5rem;
  font-family: "Inter";
  font-size: 1.5rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

h2 {
  font-family: "Bebas Neue";
  font-size: 10rem;
  filter: drop-shadow(0px 3px 0px var(--red));
}
</style>
