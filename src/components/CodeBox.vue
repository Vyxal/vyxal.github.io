<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";

const extensions = [
  EditorView.theme({
    "&": { backgroundColor: "rgb(23 23 23)" },
    ".cm-gutters": { backgroundColor: "#151515" },
    ".cm-activeLineGutter": { backgroundColor: "#1f1f1f" },
  }),
  oneDark,
];
</script>

<template>
  <div class="cont h-full p-5">
    <Codemirror
      :extensions="extensions"
      :style="{ height: '100%', width: '100%' }"
      v-model="code"
      v-if="inputType == 'textarea'"
    />
    <input type="text" v-model="code" class="bg-neutral-900 text-white p-1 border-none outline-none" v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useMainStore } from "@/stores/MainStore";

export default defineComponent({
  props: {
    dataName: {
      type: String as PropType<
        "header" | "code" | "footer" | "inputs" | "flags"
      >,
      required: true,
    },
    inputType: {
      type: String as PropType<"textarea" | "input">,
      default: "textarea",
    },
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
      },
    },
  },
});
</script>
