import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { FuseResult } from "fuse.js";
import { elementFuse, modifierFuse, ElementData, syntaxFuse, SyntaxThing } from "../util/element-data";
import { syntaxTree } from "@codemirror/language";
import { hoverTooltip, Tooltip } from "@codemirror/view";
import { createRoot } from "react-dom/client";
import { ThingCard } from "../ThingCard";

const KEYWORD = /[a-zA-Z-?!*+=&%<>][a-zA-Z0-9-?!*+=&%<>:]*/;
const PREFIXED_KEYWORD = new RegExp(`( |^)${KEYWORD.source}`);


function elementCompletion(thing: SyntaxThing, literate: boolean): Completion {
    return {
        label: literate && thing.type != "syntax" ? thing.keywords[0] ?? "<error>" : thing.symbol,
        detail: thing.name,
        info() {
            const container = document.createElement("div");
            const root = createRoot(container);
            root.render(ThingCard({ thing }));
            return {
                dom: container,
                destroy() {
                    setTimeout(() => root.unmount());
                },
            };
        },
        type: thing.type == "element" ? "method" : "keyword",
    };
}

function syncElementAutocomplete(context: CompletionContext, literate: boolean): CompletionResult | null {
    const word = context.matchBefore(literate ? KEYWORD : PREFIXED_KEYWORD);
    if (word != null) {
        word.text = word.text.trimStart();
        const results: FuseResult<SyntaxThing>[] = [...elementFuse.search(word.text), ...modifierFuse.search(word.text), ...syntaxFuse.search(word.text)];
        if (!results.length) {
            return null;
        }
        return {
            from: word.from,
            filter: false,
            options: results.map((result) => ({ ...elementCompletion(result.item, literate), boost: 10 * (1 - (result.score ?? 0)) })),
            update: (current, from, to, context) => syncElementAutocomplete(context, literate),
        };
    }
    return null;
}


export async function elementAutocomplete(elementData: ElementData, context: CompletionContext, literate: boolean): Promise<CompletionResult | null> {
    const sync = syncElementAutocomplete(context, literate);
    if (sync != null) {
        return Promise.resolve(sync);
    }
    if (context.explicit) {
        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: [...elementData.elements.values()].map((e) => elementCompletion(e, literate)),
            update: (current, from, to, context) => syncElementAutocomplete(context, literate),
        };
    }
    return Promise.resolve(null);
}

export function elementTooltip(elementData: ElementData, literate: boolean) {
    return hoverTooltip((view, pos) => {
        const node = syntaxTree(view.state).resolve(pos, 1);
        const hovered = view.state.doc.sliceString(node.from, node.to);
        let thing: SyntaxThing | undefined;
        if (node.name == "Element" || node.name == "Modifier") {
            thing = (node.name == "Modifier" ? (literate ? elementData.modifiersByKeyword : elementData.modifiers) : (literate ? elementData.elementsByKeyword : elementData.elements)).get(hovered);
        } else if (elementData.syntax.has(hovered)) {
            thing = elementData.syntax.get(hovered)!;
        } else {
            return null;
        }
        if (thing !== undefined) {
            return {
                pos: pos,
                create() {
                    const container = document.createElement("div");
                    const card = ThingCard({ thing, shadow: true });
                    const root = createRoot(container);
                    root.render(card);
                    return {
                        dom: container,
                        destroy() {
                            setTimeout(() => root.unmount());
                        },
                    };
                },
            } as Tooltip;
        }
        return null;
    });
}