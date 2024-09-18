import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, syntaxTree } from "@codemirror/language";
import type { ElementData } from "../../util/element-data";
import type { UtilWorker } from "../../util/util-worker";
import { elementAutocomplete, elementTooltip } from '../common';
import type { SyntaxNode } from "@lezer/common";
import { EditorView, hoverTooltip } from "@codemirror/view";
import { Extension, MapMode } from "@codemirror/state";
import { vyxalLanguage } from "../../../../common/scripts/languages/vyxal";
import { compressButtonPlugin } from "./compression";

export function vyxalCompletion(elementData: ElementData) {
    return vyxalLanguage.data.of({
        autocomplete(context: CompletionContext): Promise<CompletionResult | null> {
            const sugar = context.matchBefore(/#[,.^](.)/);
            if (sugar != null) {
                const desugared = elementData.sugars.get(sugar.text);
                if (typeof desugared == "string") {
                    return Promise.resolve({
                        from: sugar.from,
                        filter: false,
                        options: [
                            { label: desugared, detail: "sugar trigraph", type: "constant" },
                        ],
                    });
                }
            }
            return elementAutocomplete(elementData, context, false);
        },
    });
}

export function vyxalHover(util: UtilWorker): Extension {
    async function makeStringTooltip(view: EditorView, node: SyntaxNode): Promise<HTMLElement | null> {
        if (node.name != "String") {
            return Promise.resolve(null);
        }
        const content = view.state.doc.slice(node.from, node.to).toString();
        switch (content.at(-1)) {
            case "\"": {
                return Promise.resolve(null);
            }
            case "„": {
                const decompressed = await util.decompress(content);
                const container = document.createElement("div");
                container.innerHTML = `<b>Compressed string: </b> ${decompressed}`;
                return container;
            }
            default:
                return Promise.resolve(null);
        }
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

export function vyxal(util: UtilWorker, data: ElementData) {
    return new LanguageSupport(vyxalLanguage, [vyxalCompletion(data), vyxalHover(util), elementTooltip(data, false), compressButtonPlugin(util)]);
}