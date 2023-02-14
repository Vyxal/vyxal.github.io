<template>
  <div class="sidebar">
    <a href="https://github.com/Vyxal/Vyxal">
      <svg viewBox="0.325 0.024 50.026 55.291" width="50.026" height="55.291" xmlns="http://www.w3.org/2000/svg">
        <g stroke-linejoin="round" stroke-width="6.465" transform="matrix(1, 0, 0, 1, -21.719837, -24.963709)">
          <rect transform="rotate(-41.01)" x="-4.3189" y="38.562" width="10.583" height="64.067" fill="#333" />
          <rect transform="matrix(-.7546 -.65619 -.65619 .7546 0 0)" x="-75.339" y="-23.195" width="10.583"
            height="64.067" fill="#333" />
          <path d="m22.045 73.333 7.9861 6.9448 24.039-27.645-7.0125-8.0641z" fill="#333368" />
          <path
            d="m30.031 24.988-7.9861 6.9448c8.3376 9.5881 16.675 19.176 25.013 28.764l25.013-28.764-7.9861-6.9448-17.027 19.581z"
            fill="#d63333" fill-opacity=".5098" />
        </g>
      </svg>
    </a>
    <div class="text"><a href="https://github.com/Vyxal/Vyxal">Vyxal</a></div>
    <button class="play" @click="run">
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  background: #161616;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-right: 20px;
}

.text {
  color: white;
  font-size: 1.5rem;
}

a {
  color: white;
  text-decoration: none;
}

.play {
  all: unset;
  cursor: pointer;
}

.play:hover svg {
  fill: #ddd;
}
</style>

<script lang="ts">
import { useMainStore } from '@/stores/MainStore';
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    run() {
      const store = useMainStore();
      store.execute();
    }
  }
});
</script>