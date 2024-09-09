/// <reference lib="ES2020" />
/// <reference lib="WebWorker" />

type SBCSifyRequest = {
    type: "sbcsify",
    rqid: number,
    code: string,
};

type CompressRequest = {
    type: "compress",
    rqid: number,
    text: string,
};

type DecompressRequest = {
    type: "decompress",
    rqid: number,
    text: string,
};

type Request = SBCSifyRequest | CompressRequest | DecompressRequest;

declare const self: SharedWorkerGlobalScope;

// @ts-expect-error DATA_URI gets replaced by Webpacl
const dataUri = DATA_URI;
const vyxal = Promise.all([
    import("https://vyxal.github.io/Vyxal/vyxal.js"),
    fetch(`${dataUri}/ShortDictionary.txt`, { cache: "force-cache" }).then((response) => response.text()),
    fetch(`${dataUri}/LongDictionary.txt`, { cache: "force-cache" }).then((response) => response.text()),
]);

console.log("Utility worker loaded");
self.addEventListener("connect", (e) => {
    console.log(`Connection opened`);
    vyxal.then(([{ Vyxal }, short, long]) => {
        Vyxal.setShortDict(short);
        Vyxal.setLongDict(long);
        const port = e.ports[0];
        port.addEventListener("message", function(event: MessageEvent<Request>) {
            const rq = event.data;
            switch (rq.type) {
                case "sbcsify":
                    port.postMessage({ data: Vyxal.getSBCSified(rq.code), rqid: rq.rqid });
                    break;
                case "compress":
                    port.postMessage({ data: Vyxal.compress(rq.text), rqid: rq.rqid });
                    break;
                case "decompress":
                    port.postMessage({ data: Vyxal.decompress(rq.text), rqid: rq.rqid });
                    break;
            }
        });
        port.start();
        port.postMessage("ready"); 
    });
});

export {};