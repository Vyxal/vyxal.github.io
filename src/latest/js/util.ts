// import VYCODEPAGE from "https://vyxal.github.io/Vyxal/codepage.js";
import Fuse from "fuse.js";

export type VyRunnerState = "idle" | "starting" | "running";


export enum Theme {
    Dark, Light
}

export interface RunRequest {
    type: "run",
    workerNumber: number,
    code: string,
    inputs: string[],
    flags: string[],
}

export interface StartedMessage {
    type: "started",
    workerNumber: number,
}

export interface StdoutMessage {
    type: "stdout",
    workerNumber: number,
    text: string,
}

export interface StderrMessage {
    type: "stderr",
    workerNumber: number,
    text: string,
}

export interface WorkerNoticeMessage {
    type: "worker-notice",
    workerNumber: number,
    text: string,
}

export interface DoneMessage {
    type: "done",
    workerNumber: number,
}

export type WorkerMessage = StartedMessage | StdoutMessage | StderrMessage | WorkerNoticeMessage | DoneMessage;

export type Element = {
    name: string,
    symbol: string,
    keywords: string[],
    overloads: string[],
    vectorises: boolean,
};

export type Modifier = {
    name: string,
    symbol: string,
    description: string,
    keywords: string[],
    overloads: string[],
};

export type SyntaxFeature = {
    name: string,
    symbol: string,
    description: string,
    usage: string,
};

export type ElementData = {
    elements: Element[],
    elementMap: Map<string, Element>,
    modifiers: Modifier[],
    modifierMap: Map<string, Modifier>,
    syntax: SyntaxFeature[],
    sugars: Map<string, string>,
    codepage: Set<string>,
    version: string,
};

type RawElementData = {
    elements: Element[],
    modifiers: Modifier[],
    syntax: SyntaxFeature[],
    sugars: object,
    codepage: string,
    version: string,
};

export const ELEMENT_DATA: Promise<ElementData> = fetch("https://vyxal.github.io/Vyxal/theseus.json")
    .then((response) => response.json())
    .then((data: RawElementData) => {
        return {
            elements: data.elements,
            elementMap: new Map(data.elements.map((element) => [element.symbol, element])),
            modifiers: data.modifiers,
            modifierMap: new Map(data.modifiers.map((modifier) => [modifier.symbol, modifier])),
            syntax: data.syntax,
            sugars: new Map(Object.entries(data.sugars)),
            codepage: new Set([...data.codepage, " ", "\n"]),
            version: data.version,
        };
    });

export const elementFuse = new Fuse<Element>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "symbol",
            "weight": 3
        },
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ],
});
export const modifierFuse = new Fuse<Modifier>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ]
});
ELEMENT_DATA.then((data) => {
    elementFuse.setCollection(data.elements);
    modifierFuse.setCollection(data.modifiers);
});

export function isTheSeason() {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    start.setMonth(11, 1);
    end.setFullYear(now.getFullYear() + 1, 1, 1);
    if (now.getTime() > start.getTime() && now.getTime() < end.getTime()) {
        return true;
    }
    return false;
}

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
                new URL("./workers/util", import.meta.url),
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
                worker.port.postMessage({...message, rqid: rqid});
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type V1Permalink = {
    flags: string,
    header: string,
    code: string,
    footer: string,
    inputs: string,
};
export type V2Permalink = {
    format: 2,
    flags: string[],
    header: string,
    code: string,
    footer: string,
    inputs: string[],
};
export function encodeHash(header: string, code: string, footer: string, flags: string[], inputs: string[]): string {
    return btoa(encodeURIComponent(JSON.stringify({
        format: 2,
        header: header,
        code: code,
        footer: footer,
        flags: flags,
        inputs: inputs
    })));
}
export function decodeHash(hash: string): V2Permalink {
    const data = JSON.parse(decodeURIComponent(atob(hash)));
    if (data.format == 2) {
        return (data as V2Permalink);
    }
    return ({
        format: 2,
        flags: Array.from(data.flags as string),
        header: data.header,
        code: data.code,
        footer: data.footer,
        inputs: (data.inputs as string).split("\n")
    } as V2Permalink);
}
export function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme == null) {
        return Theme.Dark;
    }
    return Theme[theme as keyof typeof Theme];
}
export function loadSnowing() {
    const snowing = localStorage.getItem("snowing");
    if (snowing == "always") return true;
    if (snowing == "yes" && isTheSeason()) return true;
    return false;
}
