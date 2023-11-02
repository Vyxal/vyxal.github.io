import { defineStore } from "pinia";
import type { ComponentType } from "@/data/Layout";

export const useMainStore = defineStore("main", {
  state() {
    return {
      header: "",
      code: "",
      footer: "",
      output: "",
      inputs: "",
      flags: "",
      extra: "",
      short: "",
      long: "",
      worker: <null | Worker>null,
      closedTabs: [
        "CookieClicker",
        "TextCompressor",
        "Idioms",
      ] as ComponentType[],
    };
  },
  actions: {
    openTab(tab: string) {
      this.closedTabs = this.closedTabs.filter((x) => x !== tab);
    },
    cancel(msg: string) {
      this.worker?.terminate();
      this.extra = msg;
      this.worker = null;
    },
    execute() {
      const session =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      this.worker = new Worker(new URL("../worker.js", import.meta.url));

      if (this.code === "lyxal") {
        (<any>window)[atob("bG9jYXRpb24=")][atob("aHJlZg==")] = atob(
          "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=="
        );
        return;
      }

      this.worker.onmessage = (e) => {
        if (e.data.session !== session) return;
        if (e.data.command === "done") {
          this.worker = null;
          return;
        }
        let out = this.output;
        out += e.data.val;
        if (out.length > 16000) {
          this.cancel(
            "Output exceeded 16KB; output was truncated and code was terminated."
          );
          out = out.slice(0, 16000);
        }
        this.output = out;
      };

      let timeout = 10000;
      if (this.flags.includes("5")) {
        timeout = 5000;
      } else if (this.flags.includes("b")) {
        timeout = 15000;
      } else if (this.flags.includes("B")) {
        timeout = 30000;
      } else if (this.flags.includes("T")) {
        timeout = 60000;
      }

      this.output = "";
      this.extra = "";
      this.worker.postMessage({
        mode: "run",
        code:
          this.header +
          (this.header && "\n") +
          this.code +
          (this.footer && "\n") +
          this.footer,
        inputs: this.inputs,
        flags: this.flags,
        session,
        dictionary: { short: this.short, long: this.long },
      });

      setTimeout(() => {
        if (this.worker) {
          this.cancel(`Code terminated after ${timeout / 1000} seconds`);
        }
      }, timeout);
    },
  },
});
