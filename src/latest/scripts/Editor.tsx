import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import ReactCodeMirror, { keymap } from "@uiw/react-codemirror";
import { minimalSetup } from "codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import langVyxal from "./languages/lang-vyxal";
import langVyxalLit from "./languages/lang-vyxal-lit";
import { Accordion } from "react-bootstrap";
import { autocompletion } from "@codemirror/autocomplete";
import { lineNumbers } from "@codemirror/view";
import { Theme } from "./util/misc";
import { UtilWorker } from "./util/util-worker";
import { githubLight } from "@uiw/codemirror-theme-github";
import { ELEMENT_DATA } from "./util/element-data";

const EXTENSIONS = [
    keymap.of([
        {
            key: "Shift-Enter",
            run: (view) => {
                if (view.state.doc.length <= 0) return false;
                window.dispatchEvent(new Event("run-vyxal")); // dubious
                return true;
            },
            preventDefault: true,
        },
    ]),
    minimalSetup,
    autocompletion(),
    lineNumbers(),
];
const util = new UtilWorker();

const THEMES = {
    [Theme.Dark]: vscodeDark,
    [Theme.Light]: githubLight,
};

type EditorParams = {
    header: string,
    code: string,
    height: string,
    eventKey: string,
    setCode: Dispatch<SetStateAction<string>>,
    theme: Theme,
    literate: boolean,
};

export default function Editor() {
    return ELEMENT_DATA.then((data) => {
        const VYXAL = langVyxal(util, data);
        const VYXAL_LIT = langVyxalLit(util, data);
        return function({ header, code, height, eventKey, setCode, theme, literate }: EditorParams) {
            const onChange = useCallback((code: string) => {
                if (code == "lyxal") {
                    window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                }
                setCode(code);
            }, []);
            const extensions = useMemo(() => EXTENSIONS.concat([literate ? VYXAL_LIT : VYXAL]), [literate]);
            return <Accordion.Item eventKey={eventKey}>
                <Accordion.Header>{header}</Accordion.Header>
                <Accordion.Body>
                    <ReactCodeMirror
                        theme={THEMES[theme]}
                        value={code}
                        height={height}
                        onChange={onChange}
                        extensions={extensions}
                    />
                </Accordion.Body>
            </Accordion.Item>;
        };
    });
}
