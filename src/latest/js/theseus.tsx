
import { Dispatch, lazy, SetStateAction, Suspense, useEffect, useRef, useState } from "react";

import { flagsReducer, settingsFromFlags } from "./flagsReducer";
import Header from "./header";
import { Accordion, Col, Row, Container, Spinner, InputGroup, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import { useImmerReducer } from "use-immer";
import { createRoot } from "react-dom/client";
import { formatBytecount, isTheSeason, Theme, VyRunnerState } from "./util";
import { VyTerminalRef } from "./runner";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import { FlagsDialog } from "./dialogs/FlagsDialog";
import ShareDialog from "./dialogs/ShareDialog";
import { ElementOffcanvas } from "./dialogs/ElementOffcanvas";
import type Snowflakes from "magic-snowflakes";

let updatePending = false;
import("workbox-window").then(({ Workbox }) => {
    if ("serviceWorker" in navigator) {
        const wb = new Workbox("/service.js");
        wb.register();
        wb.addEventListener("waiting", () => {
            updatePending = true;
            wb.addEventListener("controlling", () => window.location.reload());
            window.addEventListener("update-accepted", () => {
                wb.messageSkipWaiting();
            });
            window.dispatchEvent(new Event("update-pending"));
        });
    } else {
        console.warn("No service worker support detected, skipping registration.");
    }
});

import("../assets/logo-256.png");
import("../assets/pwa/screenshot-narrow.png");
import("../assets/pwa/screenshot-wide.png");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type V1Permalink = {
    flags: string,
    header: string,
    code: string,
    footer: string,
    inputs: string,
};

type V2Permalink = {
    format: 2,
    flags: string[],
    header: string,
    code: string,
    footer: string,
    inputs: string[],
};

function encodeHash(header: string, code: string, footer: string, flags: string[], inputs: string[]): string {
    return btoa(encodeURIComponent(JSON.stringify({
        format: 2,
        header: header,
        code: code,
        footer: footer,
        flags: flags,
        inputs: inputs
    })));
}

function decodeHash(hash: string): V2Permalink {
    const data = JSON.parse(decodeURIComponent(atob(hash)));
    if (data.format == 2) {
        return (data as V2Permalink);
    }
    return ({
        format: 2,
        flags: Array.from(data.flags as string),
        header: data.header,
        code: data.code,
        footer: data.footer,
        inputs: (data.inputs as string).split("\n")
    } as V2Permalink);
}

export type EditorParams = { header: string, code: string, height: string, eventKey: string, setCode: Dispatch<SetStateAction<string>>, theme: Theme };

const VyTerminal = lazy(() => import("./runner"));
const Editor = lazy(() => import("./editor"));


type UpdateToastParams = {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
    onUpdateAccepted: () => unknown,
};

function UpdateToast({ show, setShow, onUpdateAccepted }: UpdateToastParams) {
    return <Toast show={show} onClose={() => setShow(false)}>
        <Toast.Header closeButton={false}>
            <strong>Update available!</strong>
        </Toast.Header>
        <Toast.Body className="d-flex flex-column">
            An update is available for the interpreter!
            <Button variant="primary" onClick={onUpdateAccepted} className="align-self-end">Install</Button>
        </Toast.Body>
    </Toast>;
}

function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme == null) {
        return Theme.Dark;
    }
    return Theme[theme as keyof typeof Theme];
}

function loadSnowing() {
    const snowing = localStorage.getItem("snowing");
    if (snowing == "always") return true;
    if (snowing == "yes" && isTheSeason()) return true;
    return false;
}

type Input = {
    id: number,
    value: string,
};

let inputId = 0;

function Body() {
    let link: V2Permalink | null;
    if (window.location.hash.length) {
        link = decodeHash(window.location.hash.slice(1));
    } else {
        link = null;
    }
    const [flags, setFlags] = useImmerReducer(flagsReducer, settingsFromFlags(link?.flags ?? []));
    const [theme, setTheme] = useState<Theme>(loadTheme());
    const [state, setState] = useState<VyRunnerState>("idle");
    const [timeout, setTimeout] = useState<number>(10);
    const [snowing, setSnowing] = useState<boolean>(loadSnowing());
    const [header, setHeader] = useState(link?.header ?? "");
    const [code, setCode] = useState(link?.code ?? "");
    const [footer, setFooter] = useState(link?.footer ?? "");
    const [inputs, setInputs] = useState<Input[]>(link?.inputs?.map((input) => ({ id: inputId++, value: input } as Input)) ?? []);
    const [showFlagsDialog, setShowFlagsDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showElementOffcanvas, setShowElementOffcanvas] = useState(false);
    const [showUpdateToast, setShowUpdateToast] = useState(updatePending);
    const runnerRef = useRef<VyTerminalRef | null>(null);
    const snowflakesRef = useRef<Snowflakes | null>(null);

    useEffect(() => {
        localStorage.setItem("theme", Theme[theme]);
        switch (theme) {
            case Theme.Dark:
                document.body.dataset["bsTheme"] = "dark";
                break;
            case Theme.Light:
                document.body.dataset["bsTheme"] = "light";
                break;
        }
    }, [theme]);

    useEffect(() => {
        window.location.hash = encodeHash(
            header, code, footer, flags.flags, inputs.map((input) => input.value)
        );
    }, [header, code, footer, flags, inputs]);

    useEffect(() => {
        const listener = () => {
            if (state != "idle") return;
            runnerRef.current?.start(
                header + code + footer,
                flags.flags,
                inputs.map((i) => i.value),
                timeout * 1000
            );
        };
        window.addEventListener("run-vyxal", listener);
        return () => window.removeEventListener("run-vyxal", listener);
    }, [header, code, footer, flags, inputs, timeout, state]);

    useEffect(() => {
        const listener = () => setShowUpdateToast(true);
        window.addEventListener("update-pending", listener);
        return () => window.removeEventListener("update-pending", listener);
    });

    useEffect(() => {
        if (snowing) {
            import("magic-snowflakes").then(({ default: Snowflakes }) => {
                if (snowflakesRef.current == null) snowflakesRef.current = new Snowflakes();
                snowflakesRef.current.start();
                snowflakesRef.current.show();
            });
        } else {
            snowflakesRef.current?.stop();
            snowflakesRef.current?.hide();
        }
        localStorage.setItem("snowing", snowing ? "yes" : "no");
    }, [snowing]);

    return <>
        <SettingsDialog
            theme={theme}
            setTheme={setTheme}
            timeout={timeout}
            setTimeout={setTimeout}
            snowing={snowing}
            setSnowing={setSnowing}
            show={showSettingsDialog}
            setShow={setShowSettingsDialog}
        />
        <FlagsDialog flags={flags} setFlags={setFlags} show={showFlagsDialog} setShow={setShowFlagsDialog} />
        <ShareDialog bytecount={formatBytecount(code, flags.literate)} code={code} flags={flags.flags.join("")} show={showShareDialog} setShow={setShowShareDialog} />
        <ElementOffcanvas show={showElementOffcanvas} setShow={setShowElementOffcanvas} />
        <Header
            state={state} flags={flags} onRunClicked={() => {
                if (runnerRef.current != null) {
                    switch (state) {
                        case "idle":
                            setState("starting");
                            runnerRef.current!.start(
                                header + code + footer,
                                flags.flags,
                                inputs.map((i) => i.value),
                                timeout * 1000
                            );
                            break;
                        case "running":
                            runnerRef.current.stop();
                            break;
                    }
                }
            }} setShowFlagsDialog={setShowFlagsDialog} setShowSettingsDialog={setShowSettingsDialog} setShowShareDialog={setShowShareDialog} setShowElementOffcanvas={setShowElementOffcanvas}
        />
        <div className="toast-container end-0 mt-2">
            <UpdateToast show={showUpdateToast} setShow={setShowUpdateToast} onUpdateAccepted={() => window.dispatchEvent(new Event("update-accepted"))} />
        </div>
        <Container className="bg-body-tertiary mt-3 rounded">
            <Row>
                <Col lg="6" className="g-0">
                    <Suspense
                        fallback={
                            <div className="d-flex justify-content-center py-4 m-2">
                                <Spinner animation="border" className="" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        }
                    >
                        <Accordion defaultActiveKey="1" alwaysOpen className="p-3">
                            <Editor header="Header" height="50px" eventKey="0" code={header} setCode={setHeader} theme={theme} />
                            <Editor header={`Code: ${formatBytecount(code, flags.literate)}`} height="100px" eventKey="1" code={code} setCode={setCode} theme={theme} />
                            <Editor header="Footer" code={footer} height="50px" eventKey="2" setCode={setFooter} theme={theme} />
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>Inputs</Accordion.Header>
                                <Accordion.Body className="d-flex flex-column">
                                    {inputs.map((input) => {
                                        return <InputGroup className="mb-2" key={input.id}>
                                            <Form.Control placeholder="Input" value={input.value} onChange={(event) => setInputs(inputs.map((item) => item.id == input.id ? { id: item.id, value: event.currentTarget.value } : item))} />
                                            <Button variant="outline-danger" title="Delete input" onClick={() => setInputs(inputs.filter((item) => item.id != input.id))}>
                                                <i className="bi bi-trash2"></i>
                                            </Button>
                                        </InputGroup>;
                                    })}
                                    <Button variant="outline-primary" title="Add input" onClick={() => setInputs([...inputs, { id: inputId++, value: "" }])} className="align-self-end">
                                        <i className="bi bi-plus-circle"></i>
                                    </Button>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Suspense>
                </Col>
                <Col lg="6">
                    <Suspense
                        fallback={
                            <div className="d-flex justify-content-center py-4 border m-2 terminal-placeholder">
                                <Spinner animation="border" className="" role="status" variant="light">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        }
                    >
                        <VyTerminal ref={runnerRef} onStart={() => setState("running")} onFinish={() => setState("idle")} />
                    </Suspense>
                </Col>
            </Row>
        </Container>
    </>;
}

const root = createRoot(document.getElementById("react-container")!);
root.render(<Body />);