<script setup lang="ts">
import { defineComponent } from 'vue';
import Glayout from "@/components/Glayout.vue";
import { ComponentItemConfig, ItemType, RowOrColumnItemConfig, type LayoutConfig, type StackItemConfig } from 'golden-layout';
import Output from '@/components/Output.vue';
import MainCode from './MainCode.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import Inputs from './Inputs.vue';
import Flags from './Flags.vue';
</script>

<template>
  <Glayout ref="gLayoutRoot" glc-path="./" style="width: 100%; height: 90%"></Glayout>
</template>

<script lang="ts">
const layout: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: [
      <RowOrColumnItemConfig>{
        type: "column",
        size: "100%",
        content: [
          <ComponentItemConfig>{
            type: "component",
            title: "Flags",
            header: { show: "top", popout: false, maximise: false },
            size: '10%',
            componentType: Flags
          },
          <StackItemConfig>{
            type: "stack",
            size: "50%",
            content: [
              {
                type: "component",
                title: "Code",
                header: { show: "top", popout: false, maximise: false },
                componentType: MainCode,
                size: '100%',
              },
              {
                type: "component",
                title: "Header",
                header: { show: "top", popout: false, maximise: false },
                componentType: Header,
                size: '100%',
              },
              {
                type: "component",
                title: "Footer",
                header: { show: "top", popout: false, maximise: false },
                componentType: Footer,
                size: '100%',
              },
            ]
          },
          <ComponentItemConfig>{
            type: "component",
            title: "Inputs",
            header: { show: "top", popout: false, maximise: false },
            size: '40%',
            componentType: Inputs
          }
        ]
      },
      <ComponentItemConfig>{
        type: "component",
        title: "Output",
        header: { show: "top", popout: false, maximise: false },
        size: '100%',
        componentType: Output,
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

<style src="golden-layout/dist/css/goldenlayout-base.css">

</style>
<style src="golden-layout/dist/css/themes/goldenlayout-dark-theme.css">

</style>