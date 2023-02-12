<template>
  <pre>{{ out }}</pre>
</template>

<script lang="ts">
import Store from '@/stores/Store';
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      out: ""
    }
  },
  mounted() {
    Store.emptyCallback = () => {
      this.out = "";
    };
    Store.outCallback = (s) => {
      this.out += s;
    };
  }
});
</script>