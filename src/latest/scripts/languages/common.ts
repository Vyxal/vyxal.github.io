import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { FuseResult } from "fuse.js";
import { renderToStaticMarkup } from "react-dom/server";
import { ModifierCard } from "../cards/ModifierCard";
import { ElementCard } from "../cards/ElementCard";
import { elementFuse, modifierFuse, Element, Modifier, ELEMENT_DATA, ElementData } from "../util/element-data";
import { syntaxTree } from "@codemirror/language";
import { hoverTooltip, Tooltip } from "@codemirror/view";

const KEYWORD = /[a-zA-Z-?!*+=&%<>][a-zA-Z0-9-?!*+=&%<>:]*/;
const PREFIXED_KEYWORD = new RegExp(`( |^)${KEYWORD.source}`);


function elementCompletion(element: Element | Modifier, literate: boolean): Completion {
    return {
        label: literate ? element.keywords[0] ?? "<error>" : element.symbol,
        detail: element.name,
        info() {
            const container = document.createElement("div");
            container.innerHTML = renderToStaticMarkup("vectorises" in element ? ElementCard({ item: element }) : ModifierCard({ item: element }));
            return container;
        },
        type: "vectorises" in element ? "method" : "keyword",
    };
}

function syncElementAutocomplete(context: CompletionContext, literate: boolean): CompletionResult | null {
    const word = context.matchBefore(literate ? KEYWORD : PREFIXED_KEYWORD);
    if (word != null) {
        word.text = word.text.trimStart();
        const results: FuseResult<Element | Modifier>[] = elementFuse.search(word.text).concat(modifierFuse.search(word.text));
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


export async function elementAutocomplete(context: CompletionContext, literate: boolean): Promise<CompletionResult | null> {
    const sync = syncElementAutocomplete(context, literate);
    if (sync != null) {
        return Promise.resolve(sync);
    }
    if (context.explicit) {
        const data = await ELEMENT_DATA;
        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: data.elements.map((e) => elementCompletion(e, literate)),
            update: (current, from, to, context) => syncElementAutocomplete(context, literate),
        };
    }
    return Promise.resolve(null);
}

export function elementTooltip(elementData: ElementData, literate: boolean) {
    return hoverTooltip((view, pos) => {
        const node = syntaxTree(view.state).resolve(pos, 1);
        const hovered = view.state.doc.sliceString(node.from, node.to);
        if (!["Element", "Modifier"].includes(node.name)) {
            return null;
        }
        const isModifier = node.name == "Modifier";
        const element = (isModifier ? (literate ? elementData.literateModifierMap : elementData.modifierMap) : (literate ? elementData.literateElementMap : elementData.elementMap)).get(hovered);
        if (element !== undefined) {
            return {
                pos: pos,
                create() {
                    const container = document.createElement("div");
                    // @ts-expect-error we already know that element is the corect type
                    container.innerHTML = renderToStaticMarkup((isModifier ? ModifierCard : ElementCard)({ item: element, shadow: true }));
                    return {
                        dom: container,
                    };
                },
            } as Tooltip;
        }
        return null;
    });
}