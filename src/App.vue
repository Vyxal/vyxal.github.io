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
    (async () => {
      const store = useMainStore();
      const short = await fetch(
        "https://raw.githubusercontent.com/Vyxal/Vyxal/version-3/shared/resources/ShortDictionary.txt"
      ).then((res) => res.text());
      const long = await fetch(
        "https://raw.githubusercontent.com/Vyxal/Vyxal/version-3/shared/resources/LongDictionary.txt"
      ).then((res) => res.text());
      store.$patch({ short, long });
    })();
    function check() {
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
    }
    check();
    window.addEventListener("hashchange", check);
  },
});
</script>
