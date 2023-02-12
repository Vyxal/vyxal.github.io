<template>
  <textarea v-model="code"></textarea>
  <div><button @click="run()">Run</button></div>
  <pre>{{ output }}</pre>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      code: "",
      output: ""
    };
  },
  methods: {
    run() {
      this.output = "";
      Vyxal.execute(this.code, "", "", res => {
        this.output += res;
      });
    }
  }
});
</script>