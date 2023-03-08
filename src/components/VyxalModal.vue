<template>
  <div class="modal" @click="$emit('close')">
    <div class="modal-content" @click.stop="">
      <div class="modal-header">
        <div class="modal-title">{{ title }}</div>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
  },
});
</script>

<style scoped>
.modal {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background: #000d;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: min(95%, 800px);
  background: white;
  border-radius: 15px;
  position: absolute;
  z-index: 200;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #ccc;
}

.modal-title {
  font-weight: bold;
  font-size: 1.3rem;
}
</style>
