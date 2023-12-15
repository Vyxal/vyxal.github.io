// import VYCODEPAGE from "https://vyxal.github.io/Vyxal/codepage.js";
import { Vyxal } from "https://vyxal.github.io/Vyxal/vyxal.js";

export type VyRunnerState = "idle" | "starting" | "running";

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

export function formatBytecount(code: string, literate: boolean) {
    let bytecount: number;
    let processedCode: string;
    const modifiers: string[] = [];
    if (literate) {
        processedCode = Vyxal.getSBCSified(code);
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

export type Element = {
    name: string,
    symbol: string,
    keywords: string[],
    overloads: string[],
    vectorises: boolean,
};

export type Modifier = {
    name: string,
    description: string,
    keywords: string[],
};

export type SyntaxFeature = {
    name: string,
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