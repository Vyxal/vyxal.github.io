<template>
  <div class="cont">
    <textarea v-model="code"></textarea>
    <br>
    <button @click="run">Run</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '@/stores/MainStore';
import { mapWritableState } from 'pinia';

export default defineComponent({
  data() {
    return {};
  },
  computed: {
    ...mapWritableState(useMainStore, ['code'])
  },
  methods: {
    run() {
      const store = useMainStore();
      store.execute();
    }
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