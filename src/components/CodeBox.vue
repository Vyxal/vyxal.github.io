<script setup lang="ts">
import { Codemirror } from 'vue-codemirror';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';

const extensions = [
  EditorView.theme({
    '&': { background: '#0c0c0c' },
    '.cm-gutters': { background: '#151515' },
    '.cm-activeLineGutter': { background: '#1f1f1f' },
    '.cm-activeLine': { background: '#141414' }
  }),
  oneDark
];
</script>

<template>
  <div class="cont">
    <Codemirror :extensions="extensions" :style="{ height: '100%', width: '100%' }" v-model="code"
      v-if="inputType == 'textarea'" />
    <input type="text" v-model="code" v-else>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useMainStore } from '@/stores/MainStore';

export default defineComponent({
  props: {
    dataName: {
      type: String as PropType<"header" | "code" | "footer" | "inputs" | "flags">,
      required: true
    },
    inputType: {
      type: String as PropType<"textarea" | "input">,
      default: "textarea"
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
  },
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

input {
  background: #0c0c0c;
  border: none;
  padding: 5px;
  outline: none !important;
  font: inherit;
}
</style>