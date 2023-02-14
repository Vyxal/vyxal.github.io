<template>
  <pre>{{ output }}</pre>
</template>

<script lang="ts">
import { useMainStore } from '@/stores/MainStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    ...mapState(useMainStore, ['output'])
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
</style>