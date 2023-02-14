<template>
  <div class="cont">
    <textarea v-model="code"></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '@/stores/MainStore';
import { mapWritableState } from 'pinia';

export default defineComponent({
  computed: {
    ...mapWritableState(useMainStore, ['code'])
  }
});
</script>

<style scoped>
  .cont {
    padding: 20px;
    height: 100%;
  }

  textarea {
    width: 100% !important;
    height: 50%;
  }
</style>