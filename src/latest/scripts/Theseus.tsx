import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { flagsReducer, settingsFromFlags } from "./flagsReducer";
import Header from "./Header";
import { Accordion, Col, Row, Container, Spinner, InputGroup, Form, Button, Tab, Nav } from "react-bootstrap";
import { useImmerReducer } from "use-immer";
import { createRoot } from "react-dom/client";
import { Theme, VyRunnerState } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { VyTerminalRef } from "./VyTerminal";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import { FlagsDialog } from "./dialogs/FlagsDialog";
import ShareDialog from "./dialogs/ShareDialog";
import { ElementOffcanvas } from "./dialogs/ElementOffcanvas";
import type Snowflakes from "magic-snowflakes";
import { loadTheme, loadSnowing } from "./util/misc";
import { V2Permalink } from "./util/permalink";
import { decodeHash, encodeHash } from "./util/permalink";
import HtmlView from "./HtmlView";

// Disabled until webpack/webpack#17870 is fixed
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register(new URL("./service.ts", import.meta.url), { type: "classic" });
// } else {
//     console.warn("No service worker support detected, skipping registration.");
// }
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const utilWorker = new UtilWorker();

const VyTerminal = lazy(() => import("./VyTerminal"));
const Editor = lazy(() => import("./Editor").then((i) => i.default()).then((component) => ({ default: component })));

type CopyButtonParams = {
    className?: string,
    title: string,
    generate: () => string,
};

function CopyButton({ className, title, generate }: CopyButtonParams) {
    const TITLES = {
        copy: title,
        copied: "Copied!",
        failed: "Failed to copy",
    };
    const ICONS = {
        copy: "bi-clipboard",
        copied: "bi-clipboard-check",
        failed: "bi-clipboard-x",
    };
    const VARIANTS = {
        copy: "outline-primary",
        copied: "success",
        failed: "danger",
    };
    const [state, setState] = useState<"copy" | "copied" | "failed">("copy");

    return (
        <Button
            variant={VARIANTS[state]}
            className={className}
            title={TITLES[state]}
            onClick={() => {
                if (state == "copy") {
                    // @ts-expect-error Apparently "clipboard-write" isn't a permission TS knows
                    navigator.permissions.query({ name: "clipboard-write" }).then((perm) => {
                        if (perm.state != "granted") {
                            console.error("Clipboard write permission not granted, is this a secure context?");
                            setState("failed");
                            return;
                        }
                        return navigator.clipboard.writeText(generate()).then(
                            () => setState("copied"),
                            () => setState("failed"),
                        );
                    }).finally(() => window.setTimeout(() => setState("copy"), 1500));
                }
            }}
        >
            <i className={`bi ${ICONS[state]}`}></i>
        </Button>
    );
}

type Input = {
    id: number,
    value: string,
};

let inputId = 0;

function Theseus() {
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
    const [bytecount, setBytecount] = useState("...");
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

    useEffect(() => {
        utilWorker.formatBytecount(code, flags.literate).then(setBytecount);
    }, [code, flags]);

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
        <ShareDialog bytecount={bytecount} code={code} flags={flags.flags.join("")} show={showShareDialog} setShow={setShowShareDialog} />
        <ElementOffcanvas show={showElementOffcanvas} setShow={setShowElementOffcanvas} />
        <Header
            state={state} flags={flags} onRunClicked={() => {
                if (runnerRef.current != null) {
                    switch (state) {
                        case "idle":
                            setState("starting");
                            runnerRef.current.start(
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
                            <Editor header="Header" height="50px" eventKey="0" code={header} setCode={setHeader} theme={theme} literate={flags.literate} />
                            <Editor header={`Code: ${bytecount}`} height="100px" eventKey="1" code={code} setCode={setCode} theme={theme} literate={flags.literate} />
                            <Editor header="Footer" code={footer} height="50px" eventKey="2" setCode={setFooter} theme={theme} literate={flags.literate} />
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>Inputs</Accordion.Header>
                                <Accordion.Body className="d-flex flex-wrap">
                                    {inputs.map((input) => {
                                        return <InputGroup className="mb-2 program-input p-1" key={input.id}>
                                            <Form.Control placeholder="Input" value={input.value} onChange={(event) => setInputs(inputs.map((item) => item.id == input.id ? { id: item.id, value: event.currentTarget.value } : item))} />
                                            <Button variant="outline-danger" title="Delete input" onClick={() => setInputs(inputs.filter((item) => item.id != input.id))}>
                                                <i className="bi bi-trash2"></i>
                                            </Button>
                                        </InputGroup>;
                                    })}
                                    <Button variant="outline-primary" title="Add input" onClick={() => setInputs([...inputs, { id: inputId++, value: "" }])} className="m-1 align-self-start">
                                        <i className="bi bi-plus-circle"></i>
                                    </Button>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Suspense>
                </Col>
                <Col lg="6">
                    <Tab.Container
                        defaultActiveKey="terminal"
                    >
                        <Nav variant="tabs" className="m-2 mb-0 align-items-end">
                            <Nav.Item>
                                <Nav.Link eventKey="terminal">Terminal</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="html">HTML</Nav.Link>
                            </Nav.Item>
                            <CopyButton className="ms-auto my-1" title="Copy output" generate={() => runnerRef.current?.getOutput() ?? ""} />
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="terminal">
                                <Suspense
                                    fallback={
                                        <div className="d-flex justify-content-center mb-2 mx-2 pt-2 border border-top-0 terminal-placeholder">
                                            <Spinner animation="border" className="" role="status" variant="light">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        </div>
                                    }
                                >
                                    <VyTerminal ref={runnerRef} onStart={() => setState("running")} onFinish={() => setState("idle")} />
                                </Suspense>
                            </Tab.Pane>
                            <Tab.Pane eventKey="html">
                                <HtmlView getOutput={runnerRef.current?.getOutput} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Col>
            </Row>
        </Container>
    </>;
}

const root = createRoot(document.getElementById("react-container")!);
root.render(<Theseus />);