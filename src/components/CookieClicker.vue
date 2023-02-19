<template>
  <div class="r">
    <div class="number">{{ number }}</div>
    <div class="cookie" @click="number++">🍪</div>
  </div>
</template>

<style scoped>
  .r {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-evenly;
    height: 100%;
    width: 100%;
    align-items: center;
  }

  .cookie {
    font-size: 9rem;
    cursor: pointer;
    transition: font-size .2s;
  }

  .cookie:hover {
    font-size: 10rem;
  }

  .cookie:active {
    font-size: 12rem;
  }

  .number {
    color: white;
    font-size: 5rem;
  }
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {number: 0};
  }
});
</script>