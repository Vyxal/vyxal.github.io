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

type WorkerRequest = SBCSifyRequest | CompressRequest | DecompressRequest;

declare const self: Window & (WorkerGlobalScope | SharedWorkerGlobalScope);

// @ts-expect-error DATA_URI gets replaced by Webpack
const dataUri = DATA_URI;
const [{ Vyxal }, short, long] = await Promise.all([
    import("https://vyxal.github.io/Vyxal/vyxal.js"),
    fetch(`${dataUri}/ShortDictionary.txt`, { cache: "force-cache" }).then((response) => response.text()),
    fetch(`${dataUri}/LongDictionary.txt`, { cache: "force-cache" }).then((response) => response.text()),
]);
Vyxal.setShortDict(short);
Vyxal.setLongDict(long);

function handleRequest(request: WorkerRequest) {
    switch (request.type) {
        case "sbcsify":
            return { data: Vyxal.getSBCSified(request.code), rqid: request.rqid };
        case "compress":
            return { data: Vyxal.compress(request.text), rqid: request.rqid };
        case "decompress":
            return { data: Vyxal.decompress(request.text), rqid: request.rqid };
    }
}

const isShared = ((me: typeof self): me is Window & SharedWorkerGlobalScope => Object.getPrototypeOf(me).constructor.name == "SharedWorkerGlobalScope")(self);

console.log(`Utility worker loaded (shared: ${isShared})`);
if (isShared) {
    self.addEventListener("connect", (connectEvent: MessageEvent<WorkerRequest>) => {
        console.log(`Connection opened`);
        const port = connectEvent.ports[0];
        port.addEventListener("message", (event) => {
            port.postMessage(handleRequest(event.data));
        });
        port.start();
        port.postMessage("ready");
    });
} else {
    self.addEventListener("message", (event) => {
        self.postMessage(handleRequest(event.data));
    });
}

export {};