<script setup lang="ts">
import { Codemirror } from "vue-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { shallowRef } from "vue";

const extensions = [
  EditorView.theme({
    "&": { backgroundColor: "rgb(23 23 23)" },
    ".cm-gutters": { backgroundColor: "#151515" },
    ".cm-activeLineGutter": { backgroundColor: "#1f1f1f" },
  }),
  keymap.of([
    {
      key: "Tab",
      run() {
        const val = view.value!.state.doc.toString();
        const cur = view.value!.state.selection.main.head;
        let line = val.slice(0, cur).split("\n").slice(-1)[0];
        if (!line) {
          return true;
        }
        const all = [...Vyxal.getElements(), ...Vyxal.getModifiers()];
        while (line.length >= 2) {
          const t = all.find((x) => x.keywords.includes(line));
          if (t) {
            view.value!.dispatch({
              changes: { from: cur - line.length, to: cur, insert: t.symbol },
            });
            return true;
          }
          line = line.slice(1);
        }
        return true;
      },
    },
  ]),
  oneDark,
];

const view = shallowRef<EditorView>();

const handleReady = (p: {
  view: EditorView;
  state: EditorState;
  container: HTMLDivElement;
}) => {
  view.value = p.view;
};
</script>

<template>
  <div class="cont h-full p-5">
    <div class="text-white text-xl mb-2" v-if="byteCount">{{ length }}</div>
    <Codemirror
      :extensions="extensions"
      :style="{
        height: byteCount ? 'calc(100% - 30px)' : '100%',
        width: '100%',
      }"
      @ready="handleReady"
      v-model="code"
      v-if="inputType == 'textarea'"
    />
    <input
      type="text"
      v-model="code"
      class="bg-neutral-900 text-white p-1 border-none outline-none"
      v-else
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useMainStore } from "@/stores/MainStore";
import { getByteCount } from "@/helpers/byte-count";
import type { EditorState } from "@codemirror/state";

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
    byteCount: {
      type: Boolean,
      default: false,
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
    length() {
      const store = useMainStore();
      const code = this.code;
      const lit = store.flags.includes("l");
      const { utfable, len } = getByteCount(
        lit ? Vyxal.getSBCSified(code) : code
      );
      const plural = len === 1 ? "" : "s";
      return (
        `${len} ${lit ? "literate " : ""}byte${plural}` +
        (utfable ? "" : " (UTF-8)")
      );
    },
  },
});
</script>
