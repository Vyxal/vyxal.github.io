import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state() {
    return {
      code: "",
      output: ""
    };
  },
  actions: {
    execute() {
      this.output = "";
      Vyxal.execute(this.code, "", "", res => {
        this.output += res;
      });
    }
  }
});