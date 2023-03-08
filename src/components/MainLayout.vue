<template>
  <div ref="element" style="width: 100%; height: 95%">
    <teleport
      v-for="{ id, type, element } in componentInstances"
      :key="id"
      :to="element"
    >
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
} from "@/data/Layout";

export default defineComponent({
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
      store.closedTabs.push(componentInstances.value[idx].type);
      componentInstances.value.splice(idx, 1);
    };

    const { element, layout, focusOutput } = useGoldenLayout(
      createComponent,
      destroyComponent,
      defaultLayout
    );

    store.$onAction(({ name }) => {
      if (name === "execute") {
        focusOutput();
      }
    });

    watch(toRef(store, "closedTabs"), (val, old) => {
      const [tab] = old.filter((x) => !val.includes(x));
      if (!tab) return;
      layout.value?.addItemAtLocation(comp(tab));
    });

    return { element, componentInstances };
  },
});
</script>
