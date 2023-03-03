<template>
  <div ref="element" style="width: 100%; height: 95%;">
    <teleport v-for="{ id, type, element } in componentInstances" :key="id" :to="element">
      <component :is="type"></component>
    </teleport>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from "@/helpers/use-golden-layout";
import { defineComponent, shallowRef } from "vue";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

import Output from "./OutputBox.vue";
import MainCode from "./MainCode.vue";
import Header from "./HeaderCode.vue";
import Footer from "./FooterCode.vue";
import Inputs from "./InputsBox.vue";
import Flags from "./FlagsBox.vue";
import CookieClicker from "./CookieClicker.vue";
import { ItemType } from 'golden-layout';

const components = { Output, MainCode, Header, Footer, Inputs, Flags, CookieClicker };

export default defineComponent({
  components,
  setup() {
    interface ComponentInstance {
      id: number;
      type: string;
      element: HTMLElement;
    }
    let instanceId = 0;
    const componentTypes = new Set(Object.keys(components));
    const componentInstances = shallowRef<ComponentInstance[]>([]);

    const createComponent = (type: string, element: HTMLElement) => {
      if (!componentTypes.has(type)) {
        throw new Error(`Component not found: '${type}'`);
      }
      ++instanceId;
      componentInstances.value = componentInstances.value.concat({
        id: instanceId,
        type,
        element,
      });
    };
    const destroyComponent = (toBeRemoved: HTMLElement) => {
      console.log(componentInstances.value);
      componentInstances.value = componentInstances.value.filter(
        ({ element }) => element !== toBeRemoved
      );
    };

    const { element } = useGoldenLayout(createComponent, destroyComponent, {
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
                componentType: "Flags",
              },
              {
                type: "stack",
                size: "50%",
                content: [
                  {
                    type: ItemType.component,
                    title: "Code",
                    header: { show: "top", popout: false, maximise: false },
                    componentType: "MainCode",
                    size: "100%",
                  },
                  {
                    type: ItemType.component,
                    title: "Header",
                    header: { show: "top", popout: false, maximise: false },
                    componentType: "Header",
                    size: "100%",
                  },
                  {
                    type: ItemType.component,
                    title: "Footer",
                    header: { show: "top", popout: false, maximise: false },
                    componentType: "Footer",
                    size: "100%",
                  },
                ],
              },
              {
                type: ItemType.component,
                title: "Inputs",
                header: { show: "top", popout: false, maximise: false },
                size: "40%",
                componentType: "Inputs",
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
                componentType: "Output",
              },
              {
                type: ItemType.component,
                title: "🍪🍪🍪🍪🍪🍪🍪",
                header: { show: "top", popout: false, maximise: false },
                size: "40%",
                componentType: "CookieClicker"
              }
            ]
          }
        ],
      },
    });

    return { element, componentInstances };
  },
});
</script>