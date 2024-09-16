import { Dispatch, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import ReactCodeMirror, { keymap, Prec } from "@uiw/react-codemirror";
import { minimalSetup } from "codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { vyxal } from "./extensions/vyxal/vyxal-extensions";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView, highlightActiveLine, highlightActiveLineGutter, lineNumbers, showPanel } from "@codemirror/view";
import { Theme } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { githubLight } from "@uiw/codemirror-theme-github";
import { ElementDataContext } from "./util/element-data";
import { vyxalLit } from "./extensions/vyxal-lit-extensions";
import { createPortal } from "react-dom";

const EXTENSIONS = [
    Prec.high(keymap.of([
        {
            key: "Ctrl-Enter",
            run(view) {
                if (view.state.doc.length <= 0) {
                    return false;
                }
                window.dispatchEvent(new Event("run-vyxal")); // dubious
                return true;
            },
            preventDefault: true,
        },
    ])),
    minimalSetup,
    autocompletion(),
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    EditorView.theme({
        "&": { height: "100%" },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": {overflow: "auto"},
        ".cm-panels": {"z-index": "0 !important"},
    }),
];
const util = new UtilWorker();

const THEMES = {
    [Theme.Dark]: vscodeDark,
    [Theme.Light]: githubLight,
};

type EditorParams = {
    code: string,
    ratio: string,
    setCode: Dispatch<SetStateAction<string>>,
    theme: Theme,
    literate: boolean,
    children: ReactNode,
};

export default function Editor({ code, ratio, children, setCode, theme, literate }: EditorParams) {
    const elementData = useContext(ElementDataContext);
    const onChange = useCallback((code: string) => {
        setCode(code);
    }, []);
    const [headerDom, setHeaderDom] = useState<HTMLElement | null>(null);
    const header = useMemo(() => showPanel.of(() => {
        const dom = document.createElement("div");
        dom.classList.add("p-1");
        setHeaderDom(dom);
        return { dom, top: true };
    }), []);

    const extensions = [...useMemo(() => EXTENSIONS.concat([literate ? vyxalLit(elementData!) : vyxal(util, elementData!)]), [literate]), header];
    return <>
        {/* <div className="bg-body-tertiary">
            {title}
        </div> */}
        <ReactCodeMirror
            basicSetup={false}
            theme={THEMES[theme]}
            value={code}
            style={{ height: ratio }}
            // height={height}
            onChange={onChange}
            extensions={extensions}
        />
        {headerDom !== null && createPortal(children, headerDom)}
    </>;
};