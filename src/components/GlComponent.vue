<template>
  <div ref="GLComponent" style="position: absolute; overflow: hidden">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const GLComponent = ref<null | HTMLElement>(null);
const numberToPixels = (value: number): string => {
  return value + "px";
};

const setPosAndSize = (
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  if (GLComponent.value) {
    const el = GLComponent.value;
    el.style.left = numberToPixels(left);
    el.style.top = numberToPixels(top);
    el.style.width = numberToPixels(width);
    el.style.height = numberToPixels(height);
  }
};
const setVisibility = (visible: boolean): void => {
  if (GLComponent.value) {
    const el = GLComponent.value;
    if (visible) {
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  }
};
const setZIndex = (value: string): void => {
  if (GLComponent.value) {
    GLComponent.value.style.zIndex = value;
  }
};
defineExpose({
  setPosAndSize,
  setVisibility,
  setZIndex,
});
</script>
