<template>
  <div class="sidebar">
    <a href="https://github.com/Vyxal/Vyxal">
      <svg viewBox="0.325 0.024 50.026 55.291" width="50.026" height="55.291" xmlns="http://www.w3.org/2000/svg">
        <g stroke-linejoin="round" stroke-width="6.465" transform="matrix(1, 0, 0, 1, -21.719837, -24.963709)">
          <rect transform="rotate(-41.01)" x="-4.3189" y="38.562" width="10.583" height="64.067" fill="#333" />
          <rect transform="matrix(-.7546 -.65619 -.65619 .7546 0 0)" x="-75.339" y="-23.195" width="10.583"
            height="64.067" fill="#333" />
          <path d="m22.045 73.333 7.9861 6.9448 24.039-27.645-7.0125-8.0641z" fill="#333368" />
          <path
            d="m30.031 24.988-7.9861 6.9448c8.3376 9.5881 16.675 19.176 25.013 28.764l25.013-28.764-7.9861-6.9448-17.027 19.581z"
            fill="#d63333" fill-opacity=".5098" />
        </g>
      </svg>
    </a>
    <div class="text"><a href="https://github.com/Vyxal/Vyxal">Vyxal</a></div>
    <!-- all icons from heroicons or remixicon -->
    <button class="play" @click="run">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </button>
    <button class="link" @click="outputLink('permalink')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill-rule="evenodd"
          d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z"
          clip-rule="evenodd" />
      </svg>
    </button>
    <button class="cgcc" @click="outputLink('cgcc')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M12 7a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 3.5l-1.323 2.68-2.957.43 2.14 2.085-.505 2.946L12 17.25l2.645 1.39-.505-2.945 2.14-2.086-2.957-.43L12 10.5zm1-8.501L18 2v3l-1.363 1.138A9.935 9.935 0 0 0 13 5.049L13 2zm-2 0v3.05a9.935 9.935 0 0 0-3.636 1.088L6 5V2l5-.001z" />
      </svg>
    </button>
    <button class="markdown" @click="outputLink('markdown')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 12.5v-4l2 2 2-2v4h2v-7h-2l-2 2-2-2H5v7h2zm11-3v-4h-2v4h-2l3 3 3-3h-2z" />
      </svg>
    </button>
    <button class="cmc" @click="outputLink('cmc')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill-rule="evenodd"
          d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.44-1.223 3.73 3.73 0 00.814-1.686c.023-.115-.022-.317-.254-.543C3.274 16.587 2.25 14.41 2.25 12c0-5.03 4.428-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.428 9-9.75 9-.833 0-1.643-.097-2.417-.279a6.721 6.721 0 01-4.246.997z"
          clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  background: #161616;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin-right: 20px;
}

.text {
  color: white;
  font-size: 1.5rem;
}

a {
  color: white;
  text-decoration: none;
}

button {
  all: unset;
  cursor: pointer;
}

button svg {
  width: 50px;
  fill: white;
}

button:hover svg {
  fill: hsl(240, 34%, 80%);
}
</style>

<script lang="ts">
import { useMainStore } from '@/stores/MainStore';
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    run() {
      const store = useMainStore();
      store.execute();
    },
    outputLink(type: string) {
      const store = useMainStore();
      const obj = [store.flags, store.header, store.footer, store.code, store.inputs];
      const link = location.protocol + '//' + location.host + '/#' + btoa(unescape(encodeURIComponent(JSON.stringify(obj))));

      const flags = store.flags.replace(/[5bBTAP…aṠ]/g, "");
      let code = store.code;
      const codepage = Vyxal.getCodepage();
      const utfable = [...code].every(x => (codepage + ' ' + '\n').includes(x));
      let len = utfable ? code.length : new TextEncoder().encode(code).length;
      let flagAppendage = flags && " `" + flags + "`";
      switch (type) {
        case "permalink":
          store.output = link;
          break;
        case "cmc":
          store.output = `[Vyxal 3, ${len} byte${code.length != 1 ? "s" : ""}${utfable ? '' : ' (UTF-8)'}: \`${code.replace(/`/g, "\\`")}\`](${link})`;
          break;
        case "cgcc":
          if (flags.includes("l")) {
            flagAppendage = "";
            code = Vyxal.getSBCSified(code);
            len = code.length;
          }
          store.output = `# [Vyxal 3](https://github.com/Vyxal/Vyxal/tree/version-3)${flagAppendage}, ${len} byte${len != 1 ? "s" : ""}${utfable ? '' : ' (UTF-8)'}
\`\`\`
${code}
\`\`\`
[Try it online!${flags.includes("l") ? " (link is to literate version)" : ""}](${link})${code.includes('🍪') ? "\n\n🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪" : ""}`;
          break;
        case "markdown":
          store.output = `[Try it online!](${link})`
          break
      }
    }
  }
});
</script>