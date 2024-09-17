import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import { Spinner, Tab, Nav, Button } from "react-bootstrap";
import { useImmer } from "use-immer";
import { createRoot } from "react-dom/client";
import { isTheSeason, loadSettings, saveSettings, Settings, Theme } from "./util/settings";
import { UtilWorker } from "./util/util-worker";
import { VyTerminalRef } from "./VyTerminal";
import { SettingsDialog } from "./dialogs/SettingsDialog";
import ShareDialog from "./dialogs/ShareDialog";
import { ElementOffcanvas } from "./dialogs/ElementOffcanvas";
import type Snowflakes from "magic-snowflakes";
import { incompatible, V2Permalink } from "./util/permalink";
import { decodeHash, encodeHash } from "./util/permalink";
import HtmlView from "./HtmlView";
import { CopyButton } from "./CopyButton";
import { ELEMENT_DATA, ElementDataContext } from "./util/element-data";
import { deserializeFlags, Flags, serializeFlags } from "./flags";
import { FlagsDialog } from "./dialogs/FlagsDialog";
import { enableMapSet } from "immer";
import { Input, InputDialog } from "./dialogs/InputDialog";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

// Disabled until webpack/webpack#17870 is fixed
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register(new URL("./service.ts", import.meta.url), { type: "classic" });
// } else {
//     console.warn("No service worker support detected, skipping registration.");
// }

const utilWorker = new UtilWorker();

const VyTerminal = lazy(() => import(
    /* webpackChunkName: "terminal" */
    "./VyTerminal"
));
const Editor = lazy(() => import(
    /* webpackChunkName: "editor" */
    "./Editor"
));

// TODO: Don't hardcode this
const LITERATE_MODE_FLAG_NAME = "Literate mode";

export type VyRunnerState = "idle" | "starting" | "running";

type TheseusProps = {
    permalink: V2Permalink | null,
};

function Theseus({ permalink }: TheseusProps) {
    const elementData = useContext(ElementDataContext)!;

    const [flags, setFlags] = useImmer<Flags>(deserializeFlags(elementData.flagDefs, new Set(permalink?.flags ?? [])));
    const literate = flags.get(LITERATE_MODE_FLAG_NAME) == true;

    const [settings, setSettings] = useImmer<Settings>(loadSettings());
    const [timeout, setTimeout] = useState<number | null>(10);

    const [header, setHeader] = useState(permalink?.header ?? "");
    const [code, setCode] = useState(permalink?.code ?? "");
    const [footer, setFooter] = useState(permalink?.footer ?? "");
    const [inputs, setInputs] = useState<Input[]>(permalink?.inputs?.map((input) => ({ id: Math.random(), value: input } as Input)) ?? []);
    const [bytecount, setBytecount] = useState("...");

    const [showFlagsDialog, setShowFlagsDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [showInputDialog, setShowInputDialog] = useState(false);
    const [showElementOffcanvas, setShowElementOffcanvas] = useState(false);

    const [state, setState] = useState<VyRunnerState>((header + code + footer).length > 0 ? "starting" : "idle");
    const [lastFocusedEditor, setLastFocusedEditor] = useState<ReactCodeMirrorRef | null>(null);
    
    const runnerRef = useRef<VyTerminalRef | null>(null);
    const snowflakesRef = useRef<Snowflakes | null>(null);
    
    useEffect(() => {
        switch (settings.theme) {
            case Theme.Dark:
                document.body.dataset["bsTheme"] = "dark";
                break;
            case Theme.Light:
                document.body.dataset["bsTheme"] = "light";
                break;
        }
        if (settings.snowing == "always" || (settings.snowing == "yes" && isTheSeason())) {
            import(
                /* webpackChunkName: "magic-snowflakes" */
                "magic-snowflakes"
            ).then(({ default: Snowflakes }) => {
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
        saveSettings(settings);
        return () => {
            snowflakesRef.current?.stop();
            snowflakesRef.current?.hide();
        };
    }, [settings]);

    useEffect(() => {
        history.replaceState(undefined, "", "#" + encodeHash(
            header, code, footer, [...serializeFlags(elementData.flagDefs, flags)], inputs.map((input) => input.value), elementData.version,
        ));
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
        utilWorker.formatBytecount(code, literate).then(setBytecount);
    }, [code, flags]);

    const literateToSbcs = useCallback(async() => {
        runnerRef.current?.showMessage(`\x1b[1mSBCS translation:\x1b[0m\n${await utilWorker.sbcsify(code)}`);
    }, [code, runnerRef]);

    return <>
        <SettingsDialog
            settings={settings}
            setSettings={setSettings}
            timeout={timeout}
            setTimeout={setTimeout}
            show={showSettingsDialog}
            setShow={setShowSettingsDialog}
        />
        <FlagsDialog flags={flags} setFlags={setFlags} show={showFlagsDialog} setShow={setShowFlagsDialog} />
        <ShareDialog bytecount={bytecount} code={code} flags={[...serializeFlags(elementData.flagDefs, flags)].join("")} show={showShareDialog} setShow={setShowShareDialog} />
        <InputDialog inputs={inputs} setInputs={setInputs} show={showInputDialog} setShow={setShowInputDialog} />
        <ElementOffcanvas
            show={showElementOffcanvas} setShow={setShowElementOffcanvas} insertCharacter={(char) => {
                lastFocusedEditor?.view?.dispatch({
                    changes: { from: lastFocusedEditor.view.state.doc.length, insert: char },
                });
            }} 
        />
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
        <main>
            <div>
                <Suspense
                    fallback={
                        <div className="d-flex justify-content-center py-4 m-2">
                            <Spinner animation="border" className="" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    }
                >
                    <Editor ratio="20%" code={header} setCode={setHeader} settings={settings} literate={literate} claimFocus={setLastFocusedEditor}>
                        Header
                    </Editor>
                    <Editor ratio="60%" code={code} setCode={setCode} settings={settings} literate={literate} claimFocus={setLastFocusedEditor} autoFocus>
                        <div className="d-flex align-items-center">
                            {bytecount}
                            {literate ? (
                                <Button variant="link" size="sm" className="ms-auto p-0" onClick={literateToSbcs}>
                                    literate to sbcs
                                </Button>
                            ) : null}
                        </div>
                    </Editor>
                    <Editor ratio="20%" code={footer} setCode={setFooter} settings={settings} literate={literate} claimFocus={setLastFocusedEditor}>
                        Footer
                    </Editor>
                </Suspense>
            </div>
            <div className="vstack">
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
                                    timeout={timeout != null ? timeout * 1000 : null}
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
            </div>
        </main>
    </>;
}

enableMapSet();
const root = createRoot(document.getElementById("react-container")!);
let permalink: V2Permalink | null;
if (window.location.hash.length) {
    permalink = decodeHash(window.location.hash.slice(1));
} else {
    permalink = null;
}
if (permalink != null && permalink.version != null && incompatible(permalink.version)) {
    window.location.replace(`https://vyxal.github.io/versions/v${permalink.version}#${location.hash.substring(1)}`);
} else {
    root.render(
        <ElementDataContext.Provider value={await ELEMENT_DATA}>
            <Theseus permalink={permalink} />
        </ElementDataContext.Provider>,
    );
}