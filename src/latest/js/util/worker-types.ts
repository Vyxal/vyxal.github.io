
export interface RunRequest {
    type: "run",
    workerNumber: number,
    code: string,
    inputs: string[],
    flags: string[]
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
