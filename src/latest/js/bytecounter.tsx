import { CODEPAGE } from "./util";

const sbcsifier: Promise<Worker> = new Promise((resolve) => {
    const worker = new Worker(
        /* webpackChunkName: "sbcs-worker" */
        new URL("./sbcs-worker", import.meta.url)
    );
    const listener = (event: MessageEvent<[string, number]>) => {
        if (event.data[1] == -1) {
            resolve(worker);
            worker.removeEventListener("message", listener);
        }
    };
    worker.addEventListener("message", listener);
});
let requestNum = 0;
async function sbcsify(code: string): Promise<string> {
    return new Promise((resolve) => {
        const num = requestNum++;
        const listener = (event: MessageEvent<[string, number]>) => {
            if (event.data[1] == num) {
                resolve(event.data[0]);
                sbcsifier.then((w) => w.removeEventListener("message", listener));
            }
        };
        sbcsifier.then((w) => {
            w.addEventListener("message", listener);
            w.postMessage([code, num]);
        });
    });
}
export async function formatBytecount(code: string, literate: boolean) {
    let bytecount: number;
    let processedCode: string;
    const modifiers: string[] = [];
    if (literate) {
        processedCode = await sbcsify(code);
    } else {
        processedCode = code;
    }
    if (literate) {
        modifiers.push("literate");
    }
    if (![...processedCode].every((char) => CODEPAGE.has(char))) {
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
