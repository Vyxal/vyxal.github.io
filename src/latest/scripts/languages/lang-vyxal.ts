import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, LRLanguage, syntaxTree } from "@codemirror/language";

import type { ElementData } from "../util/element-data";
import { UtilWorker } from "../util/util-worker";
import { renderToStaticMarkup } from 'react-dom/server';
import { ModifierCard } from "../cards/ModifierCard";
import { ElementCard } from "../cards/ElementCard";
import { elementAutocomplete } from './common';
import type { SyntaxNode } from "@lezer/common";
import { EditorView, hoverTooltip, Tooltip } from "@codemirror/view";
import { Extension, MapMode } from "@codemirror/state";
import parser from "./vyxal.grammar";
import { styleTags, tags } from "@lezer/highlight";

export const vyxalLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Digraph: tags.function(tags.propertyName),
                SugarTrigraph: tags.macroName,
                SyntaxTrigraph: tags.operator,
                StructureOpen: tags.bracket,
                StructureClose: tags.bracket,
                ModifierChar: tags.modifier,
                VariableThing: tags.variableName,
                String: tags.string,
                SingleCharString: tags.special(tags.string),
                TwoCharString: tags.special(tags.string),
                "Number!": tags.number,
                TwoCharNumber: tags.special(tags.number),
                Branch: tags.punctuation,
                ContextIndex: tags.controlKeyword,
                Comment: tags.comment,
                Element: tags.keyword,
            }),
        ],
    }),
});

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
            return elementAutocomplete(context, false);
        },
    });
}

export function vyxalHover(util: UtilWorker, elementData: ElementData): Extension {
    async function makeStringTooltip(view: EditorView, node: SyntaxNode): Promise<HTMLElement | null> {
        if (node.name != "string") {
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
    const elementTooltip = hoverTooltip((view, pos) => {
        const node = syntaxTree(view.state).resolve(pos, 1);
        console.log(node.name);
        const c = node.cursor();
        while (true) {
            if (!c.parent()) {
                break;
            }
            console.log(c.name, view.state.doc.sliceString(c.from, c.to));
        }
        const hoveredChar = view.state.doc.sliceString(node.from, node.to);
        if (node.name == "Element") {
            if (elementData.elementMap.has(hoveredChar)) {
                const element = elementData.elementMap.get(hoveredChar)!;
                return {
                    pos: pos,
                    create() {
                        const container = document.createElement("div");
                        container.innerHTML = renderToStaticMarkup(ElementCard({ item: element, shadow: true }));
                        return {
                            dom: container,
                        };
                    },
                } as Tooltip;
            }
        } else if (node.name == "ModifierChar") {
            if (elementData.modifierMap.has(hoveredChar)) {
                const modifier = elementData.modifierMap.get(hoveredChar)!;
                return {
                    pos: pos,
                    create() {
                        const container = document.createElement("div");
                        container.innerHTML = renderToStaticMarkup(ModifierCard({ item: modifier, shadow: true }));
                        return {
                            dom: container,
                        };
                    },
                } as Tooltip;
            }
        }
        return null;
    });
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
    return [stringTooltip, elementTooltip];
}

export function vyxal(util: UtilWorker, data: ElementData) {
    return new LanguageSupport(vyxalLanguage, [vyxalCompletion(data), vyxalHover(util, data)]);
}