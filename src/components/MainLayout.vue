<template>
  <div ref="element" style="width: 100%; height: 100%; overflow: scroll;" :key="LAYOUT_KEY">
    <teleport v-for="{ id, type, element } in componentInstances" :key="id" :to="element">
      <component :is="type"></component>
    </teleport>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from "@/helpers/use-golden-layout";
import { defineComponent, shallowRef, watch, toRef } from "vue";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

import { useMainStore } from "@/stores/MainStore";
import {
  comp,
  defaultLayout,
  components,
  type ComponentType,
  defaultMobileLayout,
} from "@/data/Layout";
import type { LayoutConfig } from "golden-layout";
import { storeToRefs } from "pinia";

export default defineComponent({
  data() {
    return {
      LAYOUT_KEY: 0
    }
  },
  components,
  setup() {
    interface ComponentInstance {
      id: number;
      type: ComponentType;
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
        type: type as ComponentType,
        element,
      });
    };
    const store = useMainStore();
    const destroyComponent = (toBeRemoved: HTMLElement) => {
      const idx = componentInstances.value.findIndex(
        ({ element }) => element === toBeRemoved
      );
      let type = componentInstances.value[idx].type;
      if (!store.closedTabs.includes(type)) {
        store.closedTabs.push(type);
      }
      componentInstances.value.splice(idx, 1);
    };

    let use_layout = null;
    if ((window.innerWidth / parseInt(getComputedStyle(document.body).fontSize)) < 48) {
      use_layout = defaultMobileLayout;
    } else {
      use_layout = defaultLayout;
    }

    const { element, layout, focusOutput } = useGoldenLayout(
      createComponent,
      destroyComponent,
      use_layout as LayoutConfig
    );

    store.$onAction(({ name }) => {
      if (name === "execute") {
        focusOutput();
      }
    });

    store.resetTabs();

    watch(toRef(store, "closedTabs"), (val, old) => {
      const [tab] = old.filter((x) => !val.includes(x));
      if (!tab || !store.safeToAdd) return;
      layout.value?.addItemAtLocation(comp(tab));
    });

    return { element, componentInstances };
  },
});
</script>
