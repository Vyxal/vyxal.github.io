import React, { ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { VyRunner, TerminateReason } from "./runner";
import { ElementDataContext } from "./util/element-data";
import splashes from "../data/splash.txt?raw";

type VyTerminalParams = { onStart: () => unknown, onFinish: () => unknown };

export interface VyTerminalRef {
    start(code: string, flags: string[], inputs: string[], timeout: number): void,
    stop(): void,
    getOutput(): string,
}

const VyTerminal = forwardRef(function VyTerminal(props: VyTerminalParams, ref: ForwardedRef<VyTerminalRef>) {
    const wrapperRef = useRef(null);
    const elementData = useContext(ElementDataContext);
    const runner = useRef(new VyRunner(splashes.split("\n"), elementData!.version));

    useImperativeHandle(ref, () => {
        return {
            start(code: string, flags: string[], inputs: string[], timeout: number) {
                return runner.current.start(code, flags, inputs).then(() => {
                    const timeoutHandle = window.setTimeout(() => {
                        runner.current.terminate(TerminateReason.TimedOut);
                    }, timeout);
                    runner.current.addEventListener("finished", () => window.clearTimeout(timeoutHandle), { once: true });
                });
            },
            stop() {
                return runner.current.terminate(TerminateReason.Terminated);
            },
            getOutput() {
                return runner.current.getOutput();
            },
        };
    });

    useEffect(() => {
        runner.current.attach(wrapperRef.current!);
        runner.current.addEventListener("started", props.onStart);
        runner.current.addEventListener("finished", props.onFinish);
        return () => {
            runner.current.detach();
            runner.current.removeEventListener("started", props.onStart);
            runner.current.removeEventListener("finished", props.onFinish);
        };
    }, []);

    return <div ref={wrapperRef} className="terminal-wrapper"></div>;
});
export default VyTerminal;