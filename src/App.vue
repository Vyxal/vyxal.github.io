<template>
  <div class="h-full flex items-center pr-7">
    <VyxalSidebar />
    <MainLayout />
  </div>
</template>

<script lang="ts">
import MainLayout from "@/components/MainLayout.vue";
import VyxalSidebar from "@/components/VyxalSidebar.vue";
import { defineComponent } from "vue";
import { useMainStore } from "./stores/MainStore";

export default defineComponent({
  components: { VyxalSidebar, MainLayout },
  mounted() {
    const store = useMainStore();
    const hash = location.hash.slice(1);
    if (hash) {
      try {
        const [flags, header, footer, code, inputs] = JSON.parse(
          decodeURIComponent(escape(atob(hash)))
        );
        store.$patch({
          flags,
          header,
          footer,
          code,
          inputs,
        });
        store.execute();
      } catch {
        // i have to add this comment because eslint is stupid
      }
    }
  },
});
</script>
