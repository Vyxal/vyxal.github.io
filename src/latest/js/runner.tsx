import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { RunRequest, WorkerMessage } from "./util";

enum TerminateReason {
    Terminated, TimedOut
}

class VyRunner extends EventTarget {
    started = new Event("started");
    finished = new Event("finished");
    private terminal: Terminal | null;
    private fit: FitAddon | null;
    private worker: Worker | null;
    private workerCounter = 0;

    attach(element: HTMLElement) {
        if (this.terminal != null) throw new Error("Already attached");
        this.terminal = new Terminal({
            scrollback: 1000,
        });
        this.fit = new FitAddon();
        this.terminal.loadAddon(this.fit);
        this.terminal.open(element);
        this.fit.fit();
        element.addEventListener("resize", this.onResize);
        import("https://vyxal.github.io/Vyxal/vyxal.js").then(({ Vyxal }) => {
            this.terminal!.writeln(`Welcome to \x1b[1;95mVyxal\x1b[0m ${Vyxal.getVersion()}`);
        });
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
            this.worker = new Worker(
                /* webpackChunkName: "worker" */
                /* webpackPreload: true */
                new URL("./worker.ts", import.meta.url)
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
}

type VyTerminalParams = { onStart: () => unknown, onFinish: () => unknown };

export interface VyTerminalRef {
    start(code: string, flags: string[], inputs: string[], timeout: number): void,
    stop(): void,
}

const runner = new VyRunner();
const VyTerminal = forwardRef(function VyTerminal(props: VyTerminalParams, ref: ForwardedRef<VyTerminalRef>) {
    const wrapperRef = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            start(code: string, flags: string[], inputs: string[], timeout: number) {
                if (runner.running) throw new Error("Attempted to call start() while already running");
                runner.start(code, flags, inputs);
                const timeoutHandle = window.setTimeout(() => {
                    runner.terminate(TerminateReason.TimedOut);
                }, timeout);
                runner.addEventListener("finished", () => window.clearTimeout(timeoutHandle), { once: true });
            },
            stop() {
                if (!runner.running) throw new Error("Attempted to call stop() while not running");
                runner.terminate(TerminateReason.Terminated);
            }
        };
    });

    useEffect(() => {
        runner.attach(wrapperRef.current!);
        runner.addEventListener("started", props.onStart);
        runner.addEventListener("finished", props.onFinish);
        return () => {
            runner.detach();
            runner.removeEventListener("started", props.onStart);
            runner.removeEventListener("finished", props.onFinish);
        };
    }, []);

    return <div ref={wrapperRef} className="border m-2"></div>;
});
export default VyTerminal;