
import { Dispatch, lazy, SetStateAction, Suspense, useEffect, useRef, useState } from "react";

import { flagsReducer, settingsFromFlags } from "./flagsReducer";
import Header from "./header";
import { Accordion, Col, Row, Container, Spinner, InputGroup, Form, Button } from "react-bootstrap";
import { useImmerReducer } from "use-immer";
import { createRoot } from "react-dom/client";
import { formatBytecount, Theme, VyRunnerState } from "./util";
import { VyTerminalRef } from "./runner";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import { FlagsDialog } from "./dialogs/FlagsDialog";
import ShareDialog from "./dialogs/ShareDialog";
import { ElementOffcanvas } from "./dialogs/ElementOffcanvas";

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

function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme == null) {
        return Theme.Dark;
    }
    return Theme[theme as keyof typeof Theme];
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
    const [header, setHeader] = useState(link?.header ?? "");
    const [code, setCode] = useState(link?.code ?? "");
    const [footer, setFooter] = useState(link?.footer ?? "");
    const [inputs, setInputs] = useState<Input[]>(link?.inputs?.map((input) => ({ id: inputId++, value: input } as Input)) ?? []);
    const [showFlagsDialog, setShowFlagsDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showElementOffcanvas, setShowElementOffcanvas] = useState(false);
    const runnerRef = useRef<VyTerminalRef | null>(null);

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

    return <>
        <SettingsDialog theme={theme} setTheme={setTheme} timeout={timeout} setTimeout={setTimeout} show={showSettingsDialog} setShow={setShowSettingsDialog} />
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
                                [],
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