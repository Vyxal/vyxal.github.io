<template>
  <div id="big_div" class="flex flex-col items-center" style="height: 100%">
    <VyxalSidebar />
    <MainLayout />
  </div>
</template>

<script lang="ts">
import MainLayout from "@/components/MainLayout.vue";
import VyxalSidebar from "@/components/VyxalSidebar.vue";
import { defineComponent, vModelCheckbox } from "vue";
import { useMainStore } from "./stores/MainStore";
import { storeToRefs } from "pinia";
import { defaultMobileLayout, defaultLayout } from "./data/Layout";

export default defineComponent({
  components: { VyxalSidebar, MainLayout },
  mounted() {
    document.getElementById("big_div")!.style.setProperty("--height", `${window.innerHeight}px`);
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
    function resizeEverything() {
      const store = useMainStore();
      let factor = 1;
      if ((window.innerWidth / parseInt(getComputedStyle(document.body).fontSize)) < 48) {
        factor = 2;
        if (store.desktopMode) {
          store.layoutInfo?.loadLayout(defaultMobileLayout);
          store.setDesktopMode(false);
          store.resetTabs();
        }
      } else {
        if (!store.desktopMode) {
          store.setDesktopMode(true);
          store.layoutInfo?.loadLayout(defaultLayout);
          store.resetTabs();
        }

      }
      store.layoutInfo?.updateRootSize();
      document.getElementById("big_div")!.style.setProperty("height", `${window.innerHeight * factor}px`);
    }
    resizeEverything();
    window.addEventListener("hashchange", check);
    window.addEventListener("resize", resizeEverything);

  },
})
</script>
