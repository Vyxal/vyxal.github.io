<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import Glayout from "@/components/Glayout.vue";
import { ComponentItemConfig, ItemType, type LayoutConfig } from 'golden-layout';
</script>

<template>
  <Glayout ref="gLayoutRoot" glc-path="./" style="width: 100%; height: calc(100% - 90px)"></Glayout>
</template>

<script lang="ts">
const layout: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: [
      <ComponentItemConfig>{
        type: "component",
        title: "Code",
        header: { show: "top", popout: false },
        componentType: () => import(`@/components/CodeBox.vue`),
        size: '100%',
      },
      <ComponentItemConfig>{
        type: "component",
        title: "Output",
        header: { show: "top", popout: false },
        size: '100%',
        componentType: () => import(`@/components/Output.vue`),
      },
    ],
  },
};

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
  },
  mounted() {
    (<any>this.$refs.gLayoutRoot).loadGLLayout(layout);
  }
});
</script>

<style>
  #app {
    height: 90vh;
  }
</style>

<style src="golden-layout/dist/css/goldenlayout-base.css"></style>
<style src="golden-layout/dist/css/themes/goldenlayout-light-theme.css"></style>