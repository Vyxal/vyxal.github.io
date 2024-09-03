import LongDictionary from "https://vyxal.github.io/Vyxal/LongDictionary.txt";
import ShortDictionary from "https://vyxal.github.io/Vyxal/ShortDictionary.txt";
import { Vyxal } from "https://vyxal.github.io/Vyxal/vyxal.js";

// This file cannot import anything local! That's why all this stuff is duplicated here.

interface RunRequest {
    type: "run",
    workerNumber: number,
    code: string,
    inputs: string[],
    flags: string[],
}

const dictPromise = Promise.all([
    fetch(ShortDictionary, { cache: "force-cache" }).then((response) => response.text()),
    fetch(LongDictionary, { cache: "force-cache" }).then((response) => response.text()),
]).then((responses) => {
    Vyxal.setShortDict(responses[0]);
    Vyxal.setLongDict(responses[0]);
});

self.addEventListener("message", function(message: MessageEvent<RunRequest>) {
    const request = message.data;
    console.log(`Recieved run request (workerNumber ${request.workerNumber})`);
    dictPromise.then(() => {
        this.postMessage({
            type: "started",
            workerNumber: request.workerNumber,
        });
        Vyxal.execute(
            request.code,
            request.inputs.join("\n"),
            request.flags.join(""),
            (line: string) => {
                this.postMessage({
                    type: "stdout",
                    text: line,
                    workerNumber: request.workerNumber,
                });
            },
            (line: string) => {
                this.postMessage({
                    type: "stderr",
                    text: line,
                    workerNumber: request.workerNumber,
                });
            },
        );
        console.log(`Execution complete! (workerNumber ${request.workerNumber})`);
        this.postMessage({
            type: "done",
            workerNumber: request.workerNumber,
        });
    });
});

self.postMessage({
    type: "ready",
});