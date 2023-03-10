<template>
  <div>
    <input
      type="text"
      class="p-3 m-5 rounded outline-none text-white focus:ring-4 ring-slate-900 bg-slate-700"
      placeholder="Search..."
      v-model="search"
    />
  </div>
  <div
    v-for="(idiom, i) in idioms"
    class="idiom p-5 border-b border-gray-700 last:border-none"
    :key="i"
  >
    <div class="text-white text-2xl font-bold mb-2" v-html="idiom.name"></div>
    <div class="text-white mb-3" v-html="idiom.description"></div>
    <pre
      class="bg-zinc-700 rounded p-2 cursor-pointer active:bg-zinc-800 mb-3 text-white"
      @click="copy(idiom.code)"
      >{{ idiom.code }}</pre
    >
    <div><a :href="idiom.link" class="text-white">Try it!</a></div>
  </div>
</template>

<script lang="ts">
import { go, highlight } from "fuzzysort";
import { defineComponent } from "vue";

import idioms_ from "@/data/idioms.yaml";

const idioms = idioms_ as {
  description: string;
  name: string;
  code: string;
  keywords: string[];
  link: string;
}[];

export default defineComponent({
  data() {
    return {
      search: "",
    };
  },
  methods: {
    copy(code: string) {
      navigator.clipboard.writeText(code);
    },
  },
  computed: {
    idioms() {
      if (!this.search) return idioms;
      const x = go(
        this.search,
        idioms.map((x) => ({
          ...x,
          keywords: x.keywords.join(" "),
        })),
        {
          keys: ["description", "name", "keywords"],
          threshold: -10000,
        }
      );
      return x.map((x) => {
        return {
          ...x.obj,
          description: highlight(x[0]) || x.obj.description,
          name: highlight(x[1]) || x.obj.name,
        };
      });
    },
  },
});
</script>

<style>
.idiom b {
  color: #60a5fa !important;
}
</style>
