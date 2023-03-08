<template>
  <div
    class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-40 flex justify-center items-center"
    @click="$emit('close')"
  >
    <div
      class="w-[min(95%,800px)] bg-white rounded-2xl absolute z-50"
      @click.stop=""
    >
      <div class="p-5 border-b border-gray-300">
        <div class="font-bold text-xl">{{ title }}</div>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
  },
});
</script>
