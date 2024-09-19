import { enableMapSet } from "immer";
import { createRoot } from "react-dom/client";
import { V2Permalink, decodeHash, incompatible } from "./interpreter/permalink";
import { ElementDataContext, parseElementData } from "./interpreter/element-data";
import { Theseus } from "./ui/Theseus";

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
    // @ts-expect-error DATA_URI gets replaced by Webpack
    const elementData = parseElementData(await fetch(`${DATA_URI}/theseus.json`).then((r) => r.json()));
    root.render(
        <ElementDataContext.Provider value={elementData}>
            <Theseus permalink={permalink} />
        </ElementDataContext.Provider>,
    );
}