<template>
  <div class="cont">
    <textarea v-model="code"></textarea>
    <br>
    <button @click="run">Run</button>
  </div>
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