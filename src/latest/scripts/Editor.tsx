import { Dispatch, SetStateAction, useCallback, useContext, useMemo, useRef } from "react";
import ReactCodeMirror, { keymap } from "@uiw/react-codemirror";
import { minimalSetup } from "codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { vyxal } from "./languages/vyxal-extensions";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView, lineNumbers, showPanel } from "@codemirror/view";
import { Theme } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { githubLight } from "@uiw/codemirror-theme-github";
import { ElementDataContext } from "./util/element-data";
import { vyxalLit } from "./languages/vyxal-lit-extensions";

const EXTENSIONS = [
    keymap.of([
        {
            key: "Shift-Enter",
            run(view) {
                if (view.state.doc.length <= 0) {
                    return false;
                }
                window.dispatchEvent(new Event("run-vyxal")); // dubious
                return true;
            },
            preventDefault: true,
        },
    ]),
    minimalSetup,
    autocompletion(),
    lineNumbers(),
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
    title: string,
    setCode: Dispatch<SetStateAction<string>>,
    theme: Theme,
    literate: boolean,
};

export default function Editor({ code, ratio, title, setCode, theme, literate }: EditorParams) {
    const elementData = useContext(ElementDataContext);
    const onChange = useCallback((code: string) => {
        if (code == "lyxal") {
            window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
        setCode(code);
    }, []);
    const header = useMemo(() => showPanel.of(() => {
        const dom = document.createElement("div");
        dom.classList.add("p-1");
        dom.textContent = title;
        return { dom, top: true };
    }), [title]);
    const languageExtension = useRef(literate ? vyxalLit(elementData!) : vyxal(util, elementData!));

    const extensions = [...useMemo(() => EXTENSIONS.concat([languageExtension.current]), [literate]), header];
    return <>
        {/* <div className="bg-body-tertiary">
            {title}
        </div> */}
        <ReactCodeMirror
            theme={THEMES[theme]}
            value={code}
            style={{ height: ratio }}
            // height={height}
            onChange={onChange}
            extensions={extensions}
        />
    </>;
};