import React, { ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import { VyRunner, TerminateReason } from "./runner";
import { ElementDataContext } from "./util/element-data";
import splashes from "../data/splash.txt?raw";

type VyTerminalParams = {
    code: string,
    flags: string[],
    inputs: string[],
    timeout: number,
    onStart: () => unknown,
    onFinish: () => unknown,
};

export interface VyTerminalRef {
    start(): void,
    stop(): void,
    getOutput(): string,
}

const VyTerminal = forwardRef(function VyTerminal({ code, flags, inputs, timeout, onStart, onFinish }: VyTerminalParams, ref: ForwardedRef<VyTerminalRef>) {
    const wrapperRef = useRef(null);
    const elementData = useContext(ElementDataContext);
    const runner = useRef(new VyRunner(splashes.split("\n"), elementData!.version));

    useImperativeHandle(ref, () => {
        return {
            start() {
                runner.current.start(code, flags, inputs, timeout);
            },
            stop() {
                return runner.current.terminate(TerminateReason.Terminated);
            },
            getOutput: runner.current.getOutput,
        };
    });

    useEffect(() => {
        runner.current.attach(wrapperRef.current!);
        runner.current.addEventListener("started", onStart);
        runner.current.addEventListener("finished", onFinish);
        if (code.length > 0) {
            runner.current.start(code, flags, inputs, timeout);
        }
        return () => {
            runner.current.detach();
            runner.current.removeEventListener("started", onStart);
            runner.current.removeEventListener("finished", onFinish);
        };
    }, []);

    return <div ref={wrapperRef} className="terminal-wrapper"></div>;
});
export default VyTerminal;