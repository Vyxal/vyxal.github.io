importScripts("https://vyxal.github.io/Vyxal/vyxal.js");

self.addEventListener("message", function (e) {
  const data = e.data;
  console.log("Worker received: " + data.mode);
  const session = data.session;
  const sendFn = (x) => {
    this.postMessage({ val: x, command: "append", session: session });
  };
  Vyxal.setShortDict(data.dictionary.short);
  Vyxal.setLongDict(data.dictionary.long);
  Vyxal.execute(data.code, data.inputs, data.flags, sendFn);
  this.postMessage({ command: "done", session: data.session });
});
