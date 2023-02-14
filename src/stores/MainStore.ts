import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state() {
    return {
      header: "",
      code: "",
      footer: "",
      output: "",
      inputs: "",
      flags: "",
    };
  },
  actions: {
    execute() {
      this.output = "";
      Vyxal.execute(this.header + (this.header && "\n") + this.code + (this.footer && "\n") + this.footer, this.inputs, this.flags, res => {
        this.output += res;
      });
    }
  }
});