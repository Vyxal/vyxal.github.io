<template>
  <div class="extra">{{ extra }}<span v-if="extra"> (<a href="#" @click="extra = ''">Dismiss</a>)</span></div>
  <pre>{{ output }}</pre>
</template>

<script lang="ts">
import { useMainStore } from '@/stores/MainStore';
import { mapState, mapWritableState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    ...mapState(useMainStore, ['output']),
    ...mapWritableState(useMainStore, ['extra'])
  },
});
</script>

<style scoped>
pre {
  color: white;
  padding: 10px 20px;
  white-space: pre-wrap;
  overflow: auto;
  word-break: break-all;
  max-height: 95%;
}

.extra {
  color: white;
  margin: 20px;
  margin-bottom: 0;
}

a {
  color: white;
}
</style>