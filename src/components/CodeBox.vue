<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
</script>

<template>
  <div class="cont">
    <div ref="container" style="height: 100%; width: 100%" v-if="inputType == 'textarea'"></div>
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
  mounted() {
    if (this.inputType == "textarea") {
      monaco.editor.defineTheme("vs-dark2", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": '#131313'
        }
      });
      
      const editor = monaco.editor.create(<HTMLElement>this.$refs.container, {
        theme: 'vs-dark2',
        value: "",
        automaticLayout: true,
        minimap: { enabled: false },
        lineNumbers: 'off'
      });

      this.code = editor.getValue();

      editor.onDidChangeModelContent(() => {
        this.code = editor.getValue();
      });
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
  background: #131313;
  border: none;
  padding: 5px;
  outline: none !important;
  font: inherit;
}
</style>