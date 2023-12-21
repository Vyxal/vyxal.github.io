import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { ELEMENT_DATA, RunRequest, WorkerMessage } from "./util";

const MAX_BUFFER_SIZE = 20000;

export enum TerminateReason {
    Terminated, TimedOut
}

export class VyRunner extends EventTarget {
    started = new Event("started");
    finished = new Event("finished");
    private terminal: Terminal | null;
    private fit: FitAddon | null;
    private worker: Worker | null;
    private workerCounter = 0;
    private outputBuffer: string[] = [];

    attach(element: HTMLElement) {
        if (this.terminal != null) throw new Error("Already attached");
        this.terminal = new Terminal({
            scrollback: 1000,
        });
        this.fit = new FitAddon();
        this.terminal.loadAddon(this.fit);
        this.terminal.open(element);
        this.fit.fit();
        window.addEventListener("resize", this.onResize.bind(this));
        ELEMENT_DATA.then((d) => this.terminal!.writeln(`Welcome to \x1b[1;95mVyxal\x1b[0m ${d.version}`));
    }

    private onResize() {
        this.fit?.fit();
    }

    detach() {
        if (this.terminal == null) throw new Error("Not attached");
        this.terminal!.dispose();
        this.terminal = null;
        this.fit = null;
    }

    get running() {
        return this.worker != null;
    }

    private onWorkerMessage(message: MessageEvent<WorkerMessage>) {
        const data = message.data;
        if (data.workerNumber != this.workerCounter || this.worker == null) {
            console.warn("Discarding old worker message");
            return;
        }
        if (this.terminal != null) {
            switch (data.type) {
                case "started":
                    this.terminal.clear();
                    this.dispatchEvent(this.started);
                    break;
                case "stdout":
                    this.terminal.write(data.text);
                    this.outputBuffer.push(data.text);
                    this.outputBuffer.length = Math.min(this.outputBuffer.length, MAX_BUFFER_SIZE);
                    break;
                case "stderr":
                    this.terminal.write(`\x1b[31m${data.text}\x1b[0m`);
                    break;
                case "worker-notice":
                    this.terminal.writeln(`\x1b[2m${data.text}\x1b[0m`);
                    break;
                case "done":
                    this.worker = null;
                    this.terminal.writeln("\n\x1b[0G-------");
                    this.terminal.writeln("\x1b[1;92mExecution completed\x1b[0m");
                    this.dispatchEvent(this.finished);
            }
        }
    }

    start(code: string, flags: string[], inputs: string[]) {
        if (this.worker == null) {
            this.workerCounter += 1;
            this.terminal?.clear();
            this.outputBuffer.length = 0;
            this.worker = new Worker(
                /* webpackChunkName: "worker" */
                new URL("./workers/runner.ts", import.meta.url)
            );
            this.worker.addEventListener("message", this.onWorkerMessage.bind(this));
            this.worker.postMessage({
                code: code,
                flags: flags,
                inputs: inputs,
                workerNumber: this.workerCounter
            } as RunRequest);
        }
    }

    terminate(reason: TerminateReason = TerminateReason.Terminated) {
        if (this.worker != null) {
            const worker = this.worker;
            this.worker = null;
            worker.terminate();
            this.terminal?.writeln("\n\x1b[0G-------");
            switch (reason) {
                case TerminateReason.Terminated:
                    this.terminal?.writeln("\x1b[1;31mExecution terminated\x1b[0m");
                    break;
                case TerminateReason.TimedOut:
                    this.terminal?.writeln("\x1b[1;31mExecution timed out\x1b[0m");
                    break;
            }
            this.dispatchEvent(this.finished);
        }
    }

    getOutput() {
        return this.outputBuffer.join("");
    }
}
