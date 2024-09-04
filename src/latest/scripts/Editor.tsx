import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import ReactCodeMirror, { keymap } from "@uiw/react-codemirror";
import { minimalSetup } from "codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { vyxal } from "./languages/lang-vyxal";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView, lineNumbers } from "@codemirror/view";
import { Theme } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { githubLight } from "@uiw/codemirror-theme-github";
import type { ElementData } from "./util/element-data";
import { vyxalLit } from "./languages/lang-vyxal-lit";

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

export default function Editor(data: ElementData) {
    const VYXAL = vyxal(util, data);
    const VYXAL_LIT = vyxalLit();
    return function({ code, ratio, title, setCode, theme, literate }: EditorParams) {
        const onChange = useCallback((code: string) => {
            if (code == "lyxal") {
                window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            }
            setCode(code);
        }, []);
        const extensions = useMemo(() => EXTENSIONS.concat([literate ? VYXAL_LIT : VYXAL]), [literate]);
        return <>
            <div className="bg-body-tertiary">
                {title}
            </div>
            <ReactCodeMirror
                theme={THEMES[theme]}
                value={code}
                style={{ flex: ratio }}
                // height={height}
                onChange={onChange}
                extensions={extensions}
            />
        </>;
    };
}
