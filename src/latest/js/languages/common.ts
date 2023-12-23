import type { Completion, CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import type { FuseResult } from "fuse.js";
import type { CommentTokens } from "@codemirror/commands";
import { renderToStaticMarkup } from "react-dom/server";
import { ElementCard, ModifierCard } from "../cards";
import { elementFuse, modifierFuse, Element, Modifier, ELEMENT_DATA } from "../util";

export interface LanguageData {
    commentTokens?: CommentTokens,
    autocomplete?: CompletionSource,
}

export const NUMBER_PART = /^0|[1-9][0-9]*/;
export const VARIABLE_NAME = /^[a-zA-Z][a-zA-Z0-9_]*/;
export const NUMBER = /^(((((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?)?ı((((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?)|_)?)|(((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?))/;
// TODO: Load this from theseus.json
export const MODIFIER = /[ᵈᶨ¿ᶜϩᵖⁿᵗᵡᶪᶤᵞᶳ⸠ᵒ/эᵂ∦ᵏᴴᴳ∥ᵐᵃᵉЧᶻᵛᶠᵇᵘᴿ]/; // As of Dec 7 2023
export const KEYWORD = /^[a-zA-Z-?!*+=&%<>][a-zA-Z0-9-?!*+=&%<>]*/;


function elementCompletion(element: Element | Modifier, literate: boolean): Completion {
    return {
        label: literate ? element.keywords[0] ?? "<error>" : element.symbol,
        detail: element.name,
        info() {
            const container = document.createElement("div");
            container.innerHTML = renderToStaticMarkup("vectorises" in element ? ElementCard({ item: element }) : ModifierCard({ item: element }));
            return container;
        },
        type: "vectorises" in element ? "method" : "keyword"
    };
}

function syncElementAutocomplete(context: CompletionContext, literate: boolean): CompletionResult | null {
    const word = context.matchBefore(KEYWORD);
    if (word != null) {
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


export function elementAutocomplete(context: CompletionContext, literate: boolean): Promise<CompletionResult | null> {
    const sync = syncElementAutocomplete(context, literate);
    if (sync != null) return Promise.resolve(sync);
    return ELEMENT_DATA.then((data) => {
        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: data.elements.map((e) => elementCompletion(e, literate)),
            update: (current, from, to, context) => syncElementAutocomplete(context, literate)
        };
    });   
}