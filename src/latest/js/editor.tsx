import { useCallback } from "react";
import ReactCodeMirror from "@uiw/react-codemirror";
import { minimalSetup } from "codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import langVyxal from "./lang-vyxal";
import { Accordion } from "react-bootstrap";
import { autocompletion } from "@codemirror/autocomplete";
import { lineNumbers } from "@codemirror/view";
import { Theme } from "./util";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorParams } from "./theseus";

const EXTENSIONS = [
    langVyxal(), minimalSetup, autocompletion(), lineNumbers()
];
const THEMES = {
    [Theme.Dark]: vscodeDark,
    [Theme.Light]: githubLight
};

export default function Editor({ header, code, height, eventKey, setCode, theme }: EditorParams) {
    const onChange = useCallback((code: string) => {
        if (code == "lyxal") {
            window.location.assign("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }
        setCode(code);
    }, []);
    return <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>{header}</Accordion.Header>
        <Accordion.Body>
            <ReactCodeMirror
                theme={THEMES[theme]} value={code} height={height} onChange={onChange} extensions={EXTENSIONS} 
            />
        </Accordion.Body>
    </Accordion.Item>;
}
