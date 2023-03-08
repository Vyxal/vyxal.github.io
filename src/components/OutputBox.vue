<template>
  <div class="text-white m-5 mb-0">
    {{ extra
    }}<span v-if="extra">
      (<a class="text-white hover:underline" href="#" @click="extra = ''"
        >Dismiss</a
      >)</span
    >
  </div>
  <pre
    class="text-white px-5 py-3 whitespace-pre-wrap overflow-auto break-all max-h-[calc(95%-70px)] font-mono"
    >{{ output }}</pre
  >
  <button
    class="text-white bg-slate-700 px-4 py-3 rounded cursor-pointer hover:bg-slate-800 ml-3 mt-5"
    @click="copy"
    v-if="output"
  >
    Copy to Clipboard
  </button>
</template>

<script lang="ts">
import { useMainStore } from "@/stores/MainStore";
import { mapState, mapWritableState } from "pinia";
import { defineComponent } from "vue";

export default defineComponent({
  computed: {
    ...mapState(useMainStore, ["output"]),
    ...mapWritableState(useMainStore, ["extra"]),
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.output);
    },
  },
});
</script>
