import { syntaxTree } from "@codemirror/language";
import { Extension, MapMode } from "@codemirror/state";
import { hoverTooltip } from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";
import { EditorView } from "codemirror";
import { UtilWorker } from "../../workers/util-api";

export function vyxalHover(util: UtilWorker): Extension {
    async function makeStringTooltip(view: EditorView, node: SyntaxNode): Promise<HTMLElement | null> {
        if (node.name != "String") {
            return null;
        }
        const content = view.state.sliceDoc(node.from, node.to);
        if (content.at(-1) == "”") {
            const decompressed = await util.decompress(content.slice(1, -1));
            const container = document.createElement("div");
            container.innerHTML = `<div class="card shadow"><div class="card-body">Compressed string: <code>${decompressed}</code></div></div>`;
            return container;
        }
        return null;
    }
    const stringTooltip = hoverTooltip(async(view, pos) => {
        const node = syntaxTree(view.state).resolve(pos);
        const element = await makeStringTooltip(view, node);
        if (element != null) {
            const container = document.createElement("div");
            container.appendChild(element);
            return {
                pos: pos,
                create: () => {
                    return {
                        dom: container,
                        update: async(update) => {
                            if (update.changes.touchesRange(node.from, node.to)) {
                                const newPos = update.changes.mapPos(pos, -1, MapMode.TrackDel);
                                if (newPos != null) {
                                    const element = await makeStringTooltip(
                                        view,
                                        syntaxTree(view.state).resolve(newPos),
                                    );
                                    if (element != null) {
                                        container.replaceChildren(element);
                                    }
                                }
                            }
                        },
                    };
                },
            };
        }
        return null;
    });
    return [stringTooltip];
}