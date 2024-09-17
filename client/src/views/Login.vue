<template>
  <main>
    <h2>Qual será seu nome no jogo?</h2>
    <span v-if="error !== ''">{{ error }}</span>
    <div class="input">
      <input type="text" v-model="name" @change="error = ''" />
      <button @click.prevent="handleClick" type="button">Próximo</button>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const error = ref('');
const router = useRouter();

const handleClick = async () => {
  const [ok, playerId] = await tryCreateUser(name.value);
  if (!ok) {
    error.value = 'Nome já foi usado!';
    return;
  }

  localStorage.setItem('playerId', playerId);
  router.push('/submit');
};

const tryCreateUser = async (name: string) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/player`, {
    method: 'POST',
    body: name,
    headers: {
      'Content-Type': 'text/plain'
    }
  });

  const ok = response.status === 201
  const data = await response.text()

  return ok ? [true, data] as const : [false, null] as const
}
</script>
<style scoped>
h2 {
  margin-bottom: 1rem;
}

.input {
  display: flex;
}

button {
  margin-left: 1rem;
}

main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 60px;
}
</style>
