<script setup lang="ts">
import { titles } from "@/data/Layout";
</script>

<template>
  <div class="h-full bg-neutral-900 p-5 flex flex-col items-center gap-7 mr-5">
    <a href="https://github.com/Vyxal/Vyxal/tree/version-3" target="_blank">
      <svg
        viewBox="0.325 0.024 50.026 55.291"
        width="50.026"
        height="55.291"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          stroke-linejoin="round"
          stroke-width="6.465"
          transform="matrix(1, 0, 0, 1, -21.719837, -24.963709)"
        >
          <rect
            transform="rotate(-41.01)"
            x="-4.3189"
            y="38.562"
            width="10.583"
            height="64.067"
            fill="#333"
          />
          <rect
            transform="matrix(-.7546 -.65619 -.65619 .7546 0 0)"
            x="-75.339"
            y="-23.195"
            width="10.583"
            height="64.067"
            fill="#333"
          />
          <path
            d="m22.045 73.333 7.9861 6.9448 24.039-27.645-7.0125-8.0641z"
            fill="#333368"
          />
          <path
            d="m30.031 24.988-7.9861 6.9448c8.3376 9.5881 16.675 19.176 25.013 28.764l25.013-28.764-7.9861-6.9448-17.027 19.581z"
            fill="#d63333"
            fill-opacity=".5098"
          />
        </g>
      </svg>
    </a>
    <div class="text-white text-2xl">
      <a
        class="text-white"
        href="https://github.com/Vyxal/Vyxal/tree/version-3"
        target="_blank"
        >{{ text }}</a
      >
    </div>
    <!-- all icons from heroicons or remixicon -->
    <button class="play" title="Run">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        @click="cancel"
        class="cog"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="white"
        v-if="worker"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        @click="run"
        viewBox="0 0 24 24"
        v-else
      >
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </button>
    <button class="link" @click="outputLink('permalink')" title="Get Permalink">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill-rule="evenodd"
          d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button class="cgcc" @click="outputLink('cgcc')" title="CGCC post">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M12 7a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 3.5l-1.323 2.68-2.957.43 2.14 2.085-.505 2.946L12 17.25l2.645 1.39-.505-2.945 2.14-2.086-2.957-.43L12 10.5zm1-8.501L18 2v3l-1.363 1.138A9.935 9.935 0 0 0 13 5.049L13 2zm-2 0v3.05a9.935 9.935 0 0 0-3.636 1.088L6 5V2l5-.001z"
        />
      </svg>
    </button>
    <button
      class="markdown"
      @click="outputLink('markdown')"
      title="Markdown link"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 12.5v-4l2 2 2-2v4h2v-7h-2l-2 2-2-2H5v7h2zm11-3v-4h-2v4h-2l3 3 3-3h-2z"
        />
      </svg>
    </button>
    <button class="cmc" @click="outputLink('cmc')" title="CMC">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill-rule="evenodd"
          d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button class="literate" @click="sbcs" title="Get SBCSified">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill-rule="evenodd"
          d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button
      class="!mt-auto"
      @click="modalIsOpen = true"
      v-if="closedTabs.length"
      title="Open a new tab"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill-rule="evenodd"
          d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
  <VyxalModal title="Add Tab" v-if="modalIsOpen" @close="modalIsOpen = false">
    <div
      class="cursor-pointer p-5 border-t border-gray-300 hover:bg-zinc-100 active:bg-zinc-300 last:rounded-b-2xl"
      v-for="item in closedTabs"
      @click="openTab(item)"
      :key="item"
    >
      {{ titles[item] }}
    </div>
  </VyxalModal>
</template>

<style scoped>
button {
  all: unset;
  cursor: pointer;
}

button svg {
  width: 50px;
  fill: white;
}

button svg.cog {
  fill: none;
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

button:hover svg {
  fill: hsl(240, 34%, 80%);
}

button:hover svg.cog {
  fill: none;
  stroke: hsl(240, 34%, 80%);
}
</style>

<script lang="ts">
import { useMainStore } from "@/stores/MainStore";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import VyxalModal from "@/components/VyxalModal.vue";

export default defineComponent({
  data() {
    return {
      text: "Vyxal",
      modalIsOpen: false,
    };
  },
  computed: {
    ...mapState(useMainStore, ["worker", "closedTabs"]),
  },
  mounted() {
    window.addEventListener("keydown", (e) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key === "Enter"
      ) {
        this.run();
      }
    });
  },
  methods: {
    run() {
      const store = useMainStore();
      store.execute();
      if (store.code.includes("🍪")) {
        this.text = "🍪";
      }
    },
    sbcs() {
      const store = useMainStore();
      store.output = Vyxal.getSBCSified(store.code);
    },
    cancel() {
      const store = useMainStore();
      store.cancel("Code terminated by user");
    },
    outputLink(type: string) {
      const store = useMainStore();
      const obj = [
        store.flags,
        store.header,
        store.footer,
        store.code,
        store.inputs,
      ];
      const link =
        location.protocol +
        "//" +
        location.host +
        "/#" +
        btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
      const flags = store.flags.replace(/[5bBTAP…aṠ]/g, "");
      if (store.code.includes("🍪")) {
        this.text = "🍪";
      }
      let code = store.code;
      const codepage = Vyxal.getCodepage();
      const utfable = [...code].every((x) =>
        (codepage + " " + "\n").includes(x)
      );
      let len = utfable ? code.length : new TextEncoder().encode(code).length;
      let flagAppendage = flags && " `" + flags + "`";
      switch (type) {
        case "permalink":
          store.output = link;
          break;
        case "cmc":
          store.output = `[Vyxal 3, ${len} byte${code.length != 1 ? "s" : ""}${
            utfable ? "" : " (UTF-8)"
          }: \`${code.replace(/`/g, "\\`")}\`](${link})`;
          break;
        case "cgcc":
          if (flags.includes("l")) {
            flagAppendage = "";
            code = Vyxal.getSBCSified(code);
            len = code.length;
          }
          store.output = `# [Vyxal 3](https://github.com/Vyxal/Vyxal/tree/version-3)${flagAppendage}, ${len} byte${
            len != 1 ? "s" : ""
          }${utfable ? "" : " (UTF-8)"}
\`\`\`
${code}
\`\`\`
[Try it online!${
            flags.includes("l") ? " (link is to literate version)" : ""
          }](${link})${
            code.includes("🍪")
              ? "\n\n🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪"
              : ""
          }`;
          break;
        case "markdown":
          store.output = `[Try it online!](${link})`;
          break;
      }
    },
    openTab(item: string) {
      const store = useMainStore();
      store.openTab(item);
      this.modalIsOpen = false;
    },
  },
  components: { VyxalModal },
});
</script>
