import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import { Col, Row, Container, Spinner, Tab, Nav } from "react-bootstrap";
import { useImmer } from "use-immer";
import { createRoot } from "react-dom/client";
import { Theme, VyRunnerState } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { VyTerminalRef } from "./VyTerminal";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import ShareDialog from "./dialogs/ShareDialog";
import { ElementOffcanvas } from "./dialogs/ElementOffcanvas";
import type Snowflakes from "magic-snowflakes";
import { loadTheme, loadSnowing } from "./util/misc";
import { incompatible, V2Permalink } from "./util/permalink";
import { decodeHash, encodeHash } from "./util/permalink";
import HtmlView from "./HtmlView";
import { CopyButton } from "./CopyButton";
import { ELEMENT_DATA, ElementDataContext } from "./util/element-data";
import { deserializeFlags, Flags, serializeFlags } from "./flags";
import { FlagsDialog } from "./dialogs/FlagsDialog";
import { enableMapSet } from "immer";
import { Input, InputDialog } from "./dialogs/InputDialog";

// Disabled until webpack/webpack#17870 is fixed
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register(new URL("./service.ts", import.meta.url), { type: "classic" });
// } else {
//     console.warn("No service worker support detected, skipping registration.");
// }
 

const utilWorker = new UtilWorker();

const VyTerminal = lazy(() => import("./VyTerminal"));
const Editor = lazy(() => import("./Editor").then((i) => ELEMENT_DATA.then(i.default).then((component) => ({ default: component }))));

// TODO: Don't hardcode this
const LITERATE_MODE_FLAG_NAME = "Literate mode";

function Theseus() {
    let link: V2Permalink | null;
    if (window.location.hash.length) {
        link = decodeHash(window.location.hash.slice(1));
        if (link.version != null && incompatible(link.version)) {
            window.location.replace(`https://vyxal.github.io/versions/v${link.version}#${location.hash.substring(1)}`);
        } 
    } else {
        link = null;
    }
    const elementData = useContext(ElementDataContext)!;
    const [flags, setFlags] = useImmer<Flags>(deserializeFlags(elementData.flagDefs, new Set(link?.flags ?? [])));
    const literate = flags.get(LITERATE_MODE_FLAG_NAME) == true;
    const [theme, setTheme] = useState<Theme>(loadTheme());
    const [state, setState] = useState<VyRunnerState>("idle");
    const [timeout, setTimeout] = useState<number>(10);
    const [snowing, setSnowing] = useState<boolean>(loadSnowing());
    const [header, setHeader] = useState(link?.header ?? "");
    const [code, setCode] = useState(link?.code ?? "");
    const [footer, setFooter] = useState(link?.footer ?? "");
    const [inputs, setInputs] = useState<Input[]>(link?.inputs?.map((input) => ({ id: Math.random(), value: input } as Input)) ?? []);
    const [showFlagsDialog, setShowFlagsDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showInputDialog, setShowInputDialog] = useState(false);
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
            header, code, footer, [...serializeFlags(elementData.flagDefs, flags)], inputs.map((input) => input.value), elementData.version,
        );
    }, [header, code, footer, flags, inputs]);

    useEffect(() => {
        const listener = () => {
            if (state != "idle") {
                return;
            }
            runnerRef.current?.start();
        };
        window.addEventListener("run-vyxal", listener);
        return () => window.removeEventListener("run-vyxal", listener);
    }, [header, code, footer, flags, inputs, timeout, state]);

    useEffect(() => {
        if (snowing) {
            import("magic-snowflakes").then(({ default: Snowflakes }) => {
                if (snowflakesRef.current == null) {
                    snowflakesRef.current = new Snowflakes();
                }
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
        utilWorker.formatBytecount(code, literate).then(setBytecount);
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
        <ShareDialog bytecount={bytecount} code={code} flags={[...serializeFlags(elementData.flagDefs, flags)].join("")} show={showShareDialog} setShow={setShowShareDialog} />
        <InputDialog inputs={inputs} setInputs={setInputs} show={showInputDialog} setShow={setShowInputDialog} />
        <ElementOffcanvas show={showElementOffcanvas} setShow={setShowElementOffcanvas} />
        <Header
            state={state} flags={serializeFlags(elementData.flagDefs, flags)} onRunClicked={() => {
                if (runnerRef.current != null) {
                    switch (state) {
                        case "idle":
                            setState("starting");
                            runnerRef.current.start();
                            break;
                        case "running":
                            runnerRef.current.stop();
                            break;
                    }
                }
            }} inputs={inputs} setShowFlagsDialog={setShowFlagsDialog} setShowSettingsDialog={setShowSettingsDialog} setShowShareDialog={setShowShareDialog} setShowInputDialog={setShowInputDialog} setShowElementOffcanvas={setShowElementOffcanvas}
        />
        <Container fluid className="flex-grow-1">
            <Row className="h-100">
                <Col lg="6" className="g-0 d-flex flex-column">
                    <Suspense
                        fallback={
                            <div className="d-flex justify-content-center py-4 m-2">
                                <Spinner animation="border" className="" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        }
                    >
                        <Editor ratio="20%" title="Header" code={header} setCode={setHeader} theme={theme} literate={literate} />
                        <Editor ratio="60%" title={bytecount} code={code} setCode={setCode} theme={theme} literate={literate} />
                        <Editor ratio="20%" title="Footer" code={footer} setCode={setFooter} theme={theme} literate={literate} />
                    </Suspense>
                </Col>
                <Col lg="6" className="g-0 vstack">
                    <Tab.Container
                        defaultActiveKey="terminal"
                    >
                        <Nav variant="pills" className="align-items-end m-2">
                            <Nav.Item>
                                <Nav.Link eventKey="terminal">Terminal</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="html">HTML</Nav.Link>
                            </Nav.Item>
                            <div className="ms-auto me-1">
                                <CopyButton title="Copy output" generate={() => runnerRef.current?.getOutput() ?? ""} />
                            </div>
                        </Nav>
                        <Tab.Content className="flex-grow-1 bg-body-tertiary">
                            <Tab.Pane eventKey="terminal" className="h-100 position-relative">
                                <Suspense
                                    fallback={
                                        <div className="d-flex justify-content-center pt-2 h-100 terminal-placeholder">
                                            <Spinner animation="border" className="" role="status" variant="light">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        </div>
                                    }
                                >
                                    <VyTerminal
                                        ref={runnerRef}
                                        code={header + code + footer}
                                        flags={[...serializeFlags(elementData.flagDefs, flags)]}
                                        inputs={inputs.map((i) => i.value)}
                                        timeout={timeout * 1000}
                                        onStart={() => setState("running")}
                                        onFinish={() => setState("idle")}
                                    />
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

ELEMENT_DATA.then((data) => {
    enableMapSet();
    const root = createRoot(document.getElementById("react-container")!);
    root.render(
        <ElementDataContext.Provider value={data}>
            <Theseus />
        </ElementDataContext.Provider>,
    );
});