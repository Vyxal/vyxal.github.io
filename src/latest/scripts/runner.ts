import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { RunRequest, WorkerMessage } from "./util/worker-types";

const MAX_BUFFER_SIZE = 20000;

export enum TerminateReason {
    Terminated, TimedOut,
}

export class VyRunner extends EventTarget {
    started = new Event("started");
    finished = new Event("finished");
    private terminal: Terminal | null;
    private fit: FitAddon | null;
    private worker: Promise<Worker>;
    private workerCounter = 0;
    private outputBuffer: string[] = [];
    private _state: "idle" | "booting" | "running" = "booting";
    private splashes: string[];
    private version: string;
    private timeoutHandle: number;

    constructor(splashes: string[], version: string) {
        super();
        this.splashes = splashes;
        this.version = version;
        this.worker = this.spawnWorker();
    }

    attach(element: HTMLElement) {
        if (this.terminal != null) {
            throw new Error("Already attached");
        }
        this.terminal = new Terminal({
            scrollback: 1000,
            convertEol: true,
        });
        this.fit = new FitAddon();
        this.terminal.loadAddon(this.fit);
        this.terminal.open(element);
        this.fit.fit();
        new ResizeObserver(() => requestAnimationFrame(() => this.onResize())).observe(element);
        this.terminal!.writeln(`\x1b[?25lWelcome to \x1b[1;95mVyxal\x1b[0m ${this.version}`);
        this.terminal!.writeln(`\x1b[2;3m${this.splashes[Math.floor(Math.random() * this.splashes.length)]}\x1b[0m`);
        console.log("Terminal attached");
    }

    private onResize() {
        this.fit?.fit();
    }

    detach() {
        if (this.terminal == null) {
            throw new Error("Not attached");
        }
        this.terminal!.dispose();
        this.terminal = null;
        this.fit = null;
        console.log("Terminal detached");
    }

    get state() {
        return this._state;
    }

    private spawnWorker() {
        console.log("Spawning new worker");
        this.workerCounter += 1;
        return new Promise<Worker>((resolve) => {
            const worker = new Worker(
                /* webpackChunkName: "worker" */
                new URL("./workers/runner.ts", import.meta.url),
            );
            const listener = (event: MessageEvent<WorkerMessage>) => {
                if (event.data.type == "ready") {
                    resolve(worker);
                    worker.addEventListener("message", this.onWorkerMessage.bind(this));
                    worker.removeEventListener("message", listener);
                    console.log("Worker is ready");
                }
            };
            // possible race condition? won't appear in practice
            // but if they ever develop internet that's faster than the speed of light it could be an issue
            worker.addEventListener("message", listener);
        });
    }

    private onWorkerMessage(message: MessageEvent<WorkerMessage>) {
        const data = message.data;
        if (data.workerNumber != this.workerCounter) {
            console.warn("Discarding old worker message");
            return;
        }
        if (this.terminal != null) {
            switch (data.type) {
                case "started":
                    this._state = "running";
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
                    this.terminal.writeln("\n\x1b[0G-------");
                    this.terminal.writeln("\x1b[1;92mExecution completed\x1b[0m");
                    this.dispatchEvent(this.finished);
                    this._state = "idle";
            }
        }
    }

    start(code: string, flags: string[], inputs: string[], timeout: number) {
        if (code == "lyxal") {
            window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            return;
        }
        return this.worker.then((worker) => {
            if (this._state == "running") {
                throw new Error("Attempted to start while running");
            }
            this.terminal?.clear();
            this.outputBuffer.length = 0;
            worker.postMessage({
                code: code,
                flags: flags,
                inputs: inputs,
                workerNumber: this.workerCounter,
            } as RunRequest);
            this.timeoutHandle = window.setTimeout(() => {
                this.terminate(TerminateReason.TimedOut);
            }, timeout);
            this.addEventListener("finished", () => window.clearTimeout(this.timeoutHandle!), { once: true });
        });
    }

    terminate(reason: TerminateReason = TerminateReason.Terminated) {
        if (this._state != "running") {
            throw new Error("Attempted to terminate worker while not running");
        }
        console.log("Terminating worker");
        this.worker.then((worker) => {
            this._state = "booting";
            this.worker = this.spawnWorker();
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
        });
    }

    getOutput() {
        return this.outputBuffer.join("");
    }
}
