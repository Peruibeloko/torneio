<template>
  <main>
    <h2>Quer sugerir uma banda?</h2>
    <div class="choice">
      <section class="bypass">
        <button @click.prevent="nameOnly" type="button">
          Já sugeriram a minha!
        </button>
      </section>

      <div class="divider">
        <hr />
        <span> OU </span>
        <hr />
      </div>

      <section class="suggestion">
        <div class="input">
          <input type="text" v-model="bandName" />
          <button @click.prevent="nameAndBand" type="button">
            Que tal essa?
          </button>
        </div>

        <section class="cant-use">
          <div class="used">
            Essas já foram usadas:
            <ul>
              <li>AC/DC</li>
              <li>Beatles</li>
              <li>Gorillaz</li>
              <li>Guns N' Roses</li>
              <li>Led Zeppelin</li>
              <li>Nirvana</li>
              <li>Red Hot Chilli Peppers</li>
              <li>Van Halen</li>
              <li>Queen</li>
              <li>The Killers</li>
              <li>Titãs</li>
            </ul>
          </div>
          <div class="suggested">
            Já sugeriram essas:
            <ul>
              <li v-for="band in currentBands">{{ band }}</li>
            </ul>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import { useSocket } from "../composables/socket";
import { Messages } from "../messages";

const bandName = ref("");
const currentBands = ref<string[]>([]);
const router = useRouter();
const socket = toValue(inject("socket")) as WebSocket;

const { send } = useSocket(socket, (msg) => {
  switch (msg.type) {
    case "updateBands":
      currentBands.value.push(...msg.data);
      break;

    default:
      return;
  }
});

onMounted(() => send(Messages.getBands()));

const nameOnly = () => {
  router.push("/play");
};

const nameAndBand = () => {
  send(Messages.enterLobby(bandName.value));
  router.push("/play");
};
</script>

<style scoped>
main {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 3rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


h2 {
  font-family: "Bebas Neue";
}

.choice {
  display: flex;
  width: 100%;
}

.bypass {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;

  button {
    width: 15rem;
    font-size: 2rem;
    font-family: 'Bebas Neue';
  }
}

.bypass, .suggestion {
  flex-basis: 0;
  flex-grow: 1;
}

.divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 2rem;

  span {
    font-family: "Bebas Neue";
    font-size: 2rem;
  }

  hr {
    height: 100%;
    width: 0;
    margin: 1rem 0;
  }
}

.cant-use {
  display: flex;
  gap: 3rem;
}

.input {
  margin-bottom: 1rem;

  button {
    margin-left: 1rem;
  }
}

div.suggested > ul > li {
  animation: 200ms fadein 1 forwards;
}

ul {
  margin-top: 1rem;
}

li {
  list-style: none;

  &::before {
    content: '🤘';
    margin-right: 0.5rem;
  }
}


</style>
