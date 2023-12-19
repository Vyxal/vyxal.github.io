import { Vyxal } from "https://vyxal.github.io/Vyxal/vyxal.js";

console.log("SBCSifier worker loaded");
self.postMessage(["", -1]);
self.addEventListener("message", function (event: MessageEvent<[string, number]>) {
    self.postMessage([Vyxal.getSBCSified(event.data[0]), event.data[1]]);
});