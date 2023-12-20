import { Vyxal } from "https://vyxal.github.io/Vyxal/vyxal.js";

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

console.log("Utility worker loaded");
self.postMessage("ready");
self.addEventListener("message", function (event: MessageEvent<Request>) {
    const rq = event.data;
    switch (rq.type) {
        case "sbcsify":
            self.postMessage({data: Vyxal.getSBCSified(rq.code), rqid: rq.rqid});
            break;
        case "compress":
            self.postMessage({data: Vyxal.compress(rq.text), rqid: rq.rqid});
            break;
        case "decompress":
            self.postMessage({data: Vyxal.decompress(rq.text), rqid: rq.rqid});
            break;
    }
});