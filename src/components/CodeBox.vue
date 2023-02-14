<template>
  <div class="cont">
    <textarea v-model="code"></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useMainStore } from '@/stores/MainStore';

export default defineComponent({
  props: {
    dataName: {
      type: String as PropType<"header" | "code" | "footer">,
      required: true
    }
  },
  computed: {
    code: {
      get() {
        const store = useMainStore();
        return store[this.dataName];
      },
      set(newVal: string) {
        const store = useMainStore();
        store.$patch({ [this.dataName]: newVal });
      }
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