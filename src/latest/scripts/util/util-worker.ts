import { ELEMENT_DATA } from "./element-data";


type UtilWorkerResponse<T> = {
    rqid: number,
    data: T,
};

export class UtilWorker {
    private worker: Promise<SharedWorker>;
    private rqid: number = 0;
    constructor() {
        this.worker = new Promise((resolve) => {
            const worker = new SharedWorker(
                /* webpackChunkName: "util-worker" */
                new URL("../workers/util", import.meta.url),
                { name: "util-worker" }
            );
            const readyListener = (event: MessageEvent<unknown>) => {
                if (event.data != "ready") throw Error("Unexpected initial message");
                resolve(worker);
                worker.port.removeEventListener("message", readyListener);
            };
            worker.port.start();
            worker.port.addEventListener("message", readyListener);
        });
    }

    private send<T>(message: object): Promise<T> {
        return new Promise((resolve) => {
            this.worker.then((worker) => {
                const rqid = this.rqid++;
                const listener = (event: MessageEvent<UtilWorkerResponse<T>>) => {
                    if (event.data.rqid == rqid) {
                        resolve(event.data.data);
                        worker.port.removeEventListener("message", listener);
                    }
                };
                worker.port.addEventListener("message", listener);
                worker.port.postMessage({ ...message, rqid: rqid });
            });
        });
    }

    async sbcsify(code: string) {
        return (await this.send<string>({
            type: "sbcsify",
            code: code,
        }));
    }

    async decompress(compressed: string) {
        return (await this.send<string>({
            type: "decompress",
            text: compressed,
        }));
    }

    async formatBytecount(code: string, literate: boolean) {
        let bytecount: number;
        let processedCode: string;
        const modifiers: string[] = [];
        const codepage = (await ELEMENT_DATA).codepage;
        if (literate) {
            processedCode = await this.sbcsify(code);
        } else {
            processedCode = code;
        }
        if (literate) {
            modifiers.push("literate");
        }
        if (![...processedCode].every((char) => codepage.has(char))) {
            bytecount = processedCode.length;
            modifiers.push("UTF-8");
        } else {
            bytecount = new Blob([processedCode]).size; // ick
        }
        return (
            bytecount.toString()
            + (modifiers.length ? ` (${modifiers.join(", ")})` : "")
            + ` byte${bytecount == 1 ? "" : "s"}`
        );
    }

}