import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, } from "react";
import { VyRunner, TerminateReason } from "./runner";

type VyTerminalParams = { onStart: () => unknown, onFinish: () => unknown };

export interface VyTerminalRef {
    start(code: string, flags: string[], inputs: string[], timeout: number): void,
    stop(): void,
    getOutput(): string,
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
            },
            getOutput() {
                return runner.getOutput();
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

    return <div ref={wrapperRef} className="border border-top-0 mb-2 mx-2"></div>;
});
export default VyTerminal;