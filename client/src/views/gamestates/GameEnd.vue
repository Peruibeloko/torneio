<template>
  <main>
    <h3>Grande vencedor</h3>
    <h2>{{ winner }}</h2>
  </main>
</template>

<script setup lang="ts">
defineProps<{ winner: string }>();
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 60%;
  width: 100%;
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
