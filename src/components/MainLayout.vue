<script setup lang="ts">
import { defineComponent } from "vue";
import Glayout from "@/components/GoldenLayout.vue";
import { ItemType, type LayoutConfig } from "golden-layout";
import Output from "@/components/OutputBox.vue";
import MainCode from "./MainCode.vue";
import Header from "./HeaderCode.vue";
import Footer from "./FooterCode.vue";
import Inputs from "./InputsBox.vue";
import Flags from "./FlagsBox.vue";
import CookieClicker from "./CookieClicker.vue";
</script>

<template>
  <Glayout ref="gLayoutRoot" style="width: 100%; height: 90%"></Glayout>
</template>

<script lang="ts">
const layout: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: ItemType.column,
        size: "100%",
        content: [
          {
            type: ItemType.component,
            title: "Flags",
            header: { show: "top", popout: false, maximise: false },
            size: "10%",
            componentType: Flags,
          },
          {
            type: "stack",
            size: "50%",
            content: [
              {
                type: ItemType.component,
                title: "Code",
                header: { show: "top", popout: false, maximise: false },
                componentType: MainCode,
                size: "100%",
              },
              {
                type: ItemType.component,
                title: "Header",
                header: { show: "top", popout: false, maximise: false },
                componentType: Header,
                size: "100%",
              },
              {
                type: ItemType.component,
                title: "Footer",
                header: { show: "top", popout: false, maximise: false },
                componentType: Footer,
                size: "100%",
              },
            ],
          },
          {
            type: ItemType.component,
            title: "Inputs",
            header: { show: "top", popout: false, maximise: false },
            size: "40%",
            componentType: Inputs,
          },
        ],
      },
      {
        type: ItemType.column,
        size: "100%",
        content: [
          {
            type: ItemType.component,
            title: "Output",
            header: { show: "top", popout: false, maximise: false },
            size: "60%",
            componentType: Output,
          },
          {
            type: ItemType.component,
            title: "🍪🍪🍪🍪🍪🍪🍪",
            header: { show: "top", popout: false, maximise: false },
            size: "40%",
            componentType: CookieClicker
          }
        ]
      }
    ],
  },
};

export default defineComponent({
  data() {
    return {
      code: "",
      output: "",
    };
  },
  methods: {
    run() {
      this.output = "";
      Vyxal.execute(this.code, "", "", (res) => {
        this.output += res;
      });
    },
  },
  mounted() {
    (this.$refs.gLayoutRoot as any).loadGLLayout(layout);
  },
});
</script>

<style src="golden-layout/dist/css/goldenlayout-base.css"></style>
<style src="golden-layout/dist/css/themes/goldenlayout-dark-theme.css"></style>
