<template>
    <button class="text-white bg-slate-700 px-4 py-3 rounded cursor-pointer hover:bg-slate-800 ml-3" @click="print">
        Get the the layout infomration
    </button>
    <pre class="m-4 text-white whitespace-pre-wrap font-mono bg-slate-800 p-4 rounded"
        style="overflow-y:scroll; height: 100%;" v-if="layoutinfo">{{ layoutinfo }}</pre>
</template>
<script lang="ts">
import { useMainStore } from "@/stores/MainStore";
import { defineComponent } from "vue";

export default defineComponent({
    data() {
        return {
            layoutinfo: "",
        };
    },
    methods: {
        print() {
            const store = useMainStore();
            this.layoutinfo = store.layoutInfo?.saveLayout();
        },
    },
});
</script>