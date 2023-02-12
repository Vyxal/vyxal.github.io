<template>
  <textarea v-model="code"></textarea>
  <br>
  <button @click="run">Run</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Store from '@/stores/Store';

export default defineComponent({
  data() {
    return {
      code: ""
    };
  },
  methods: {
    run() {
      Store.emptyCallback();
      Vyxal.execute(this.code, "", "", res => {
        Store.outCallback(res);
      });
    }
  }
});
</script>