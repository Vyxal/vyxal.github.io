<template>
  <div class="flex flex-col justify-evenly h-full w-full items-center">
    <div class="text-white text-8xl">{{ number }}</div>
    <div
      class="text-[9rem] hover:text-[10rem] active:text-[12rem] cursor-pointer transition-all select-none"
      @click="number++"
    >
      🍪
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return { number: 0 };
  },
});
</script>
