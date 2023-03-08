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
    class="text-white px-5 py-3 whitespace-pre-wrap overflow-auto break-all max-h-[95%] font-mono"
    >{{ output }}</pre
  >
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
});
</script>
