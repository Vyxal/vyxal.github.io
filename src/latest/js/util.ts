// import VYCODEPAGE from "https://vyxal.github.io/Vyxal/codepage.js";
import Fuse from "fuse.js";
import { Vyxal } from "https://vyxal.github.io/Vyxal/vyxal.js";

export type VyRunnerState = "idle" | "starting" | "running";

// TODO: Load this from the data JSON
export const CODEPAGE = new Set(Vyxal.getCodepage() + " " + "\n");

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
    syntax: SyntaxFeature[],
    sugars: Map<string, string>,
};

type RawElementData = {
    elements: Element[],
    modifiers: Modifier[],
    syntax: SyntaxFeature[],
    sugars: object,
};

export const ELEMENT_DATA: Promise<ElementData> = fetch("https://vyxal.github.io/Vyxal/theseus.json")
    .then((response) => response.json())
    .then((data: RawElementData) => {
        return {
            elements: data.elements,
            elementMap: new Map(data.elements.map((element) => [element.symbol, element])),
            modifiers: data.modifiers,
            syntax: data.syntax,
            sugars: new Map(Object.entries(data.sugars))
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