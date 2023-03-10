<script setup lang="ts">
import idioms from "@/data/idioms.yaml";

console.log(idioms);

function copy(code: string) {
  navigator.clipboard.writeText(code);
}
</script>

<template>
  <div
    v-for="(idiom, i) in idioms"
    class="p-5 border-b border-gray-700 last:border-none"
    :key="i"
  >
    <div class="text-white text-2xl font-bold mb-2">{{ idiom.name }}</div>
    <div class="text-white mb-3">{{ idiom.description }}</div>
    <pre
      class="bg-zinc-700 rounded p-2 cursor-pointer active:bg-zinc-800 mb-3"
      @click="copy(idiom.code)"
      >{{ idiom.code }}</pre
    >
    <div><a :href="idiom.link" class="text-white">Try it!</a></div>
  </div>
</template>
