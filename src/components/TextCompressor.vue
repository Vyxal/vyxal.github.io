<template>
  <textarea
    v-model="text"
    placeholder="Text to compress..."
    class="p-3 m-4 w-[90%] rounded outline-none text-white focus:ring-4 ring-slate-900 bg-slate-700"
  />
  <div class="m-4">
    <button
      class="text-white bg-slate-700 px-4 py-3 rounded cursor-pointer hover:bg-slate-800"
      @click="compress"
    >
      Compress
    </button>
    <button
      class="text-white bg-slate-700 px-4 py-3 rounded cursor-pointer hover:bg-slate-800 ml-3"
      @click="copy"
      v-if="compressed"
    >
      Copy to Clipboard
    </button>
  </div>
  <pre
    class="m-4 text-white whitespace-pre-wrap font-mono bg-slate-800 p-4 rounded"
    v-if="compressed"
    >{{ compressed }}</pre
  >
</template>

<script lang="ts">
import { useMainStore } from "@/stores/MainStore";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      compressed: "",
      text: "",
    };
  },
  methods: {
    compress() {
      const store = useMainStore();
      Vyxal.setShortDict(store.short);
      Vyxal.setLongDict(store.long);
      this.compressed = Vyxal.compress(this.text);
    },
    copy() {
      navigator.clipboard.writeText(this.compressed);
    },
  },
});
</script>
