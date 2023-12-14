import Fuse from 'fuse.js';
import { CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { CommentTokens } from "@codemirror/commands";
import { LanguageSupport, StreamLanguage, StreamParser, StringStream } from "@codemirror/language";

import { sugarTrigraphs } from "./sugar-trigraphs";

const VARIABLE_NAME = /[a-zA-Z][a-zA-Z0-9_]*/;
const NUMBER = /(((((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?)?ı((((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?)|_)?)|(((0|[1-9][0-9]*)?\.[0-9]*|0|[1-9][0-9]*)_?))/;
const STRING = /".*["„”“]/;
const MODIFIER = /[ᵈᶨ¿ᶜϩᵖⁿᵗᵡᶪᶤᵞᶳ⸠ᵒ/эᵂ∦ᵏᴴᴳ∥ᵐᵃᵉЧᶻᵛᶠᵇᵘᴿ]/; // As of Dec 7 2023

enum Mode {
    Normal,
    VariableOp,
    LambdaArgs
}

type VyxalState = {
    mode: Mode,
};

interface LanguageData {
    commentTokens?: CommentTokens,
    autocomplete?: CompletionSource,
}

type DescriptionEntry = {
    name: string,
    description: string,
    token: string,
    overloads: string,
};
type Element = {
    name: string,
    token: string,
    keywords: string[],
    overloads: string,
};

class VyxalLanguage implements StreamParser<VyxalState> {
    elements: Fuse<Element> | null = null;
    constructor() {
        fetch("https://vyxal.github.io/Vyxal/descriptions.json")
            .then((response) => response.json())
            .then((descriptions) => {
                const elements: Element[] = [];
                for (const element of (Object.values(descriptions) as DescriptionEntry[][]).flat()) {
                    elements.push({
                        name: element.name,
                        token: element.token,
                        keywords: element.description.split(" "),
                        overloads: element.overloads,
                    });
                }
                console.log(`Loaded ${elements.length} elements`);
                this.elements = new Fuse(elements, {
                    includeScore: true,
                    threshold: 0.4,
                    keys: ["token", "name", "keywords"],
                });
            });
    }
    name = "vyxal3";
    languageData: LanguageData = {
        commentTokens: {
            line: "##"
        },
        autocomplete: this.autocomplete.bind(this)
    };
    elementAutocomplete(context: CompletionContext): CompletionResult | null {
        const word = context.matchBefore(/[a-zA-Z].*/);
        if (word != null) {
            const results = this.elements!.search(word.text);
            console.log(results);
            return {
                from: word.from,
                filter: false,
                options: results.map((result) => {
                    return {
                        label: result.item.token,
                        detail: result.item.name,
                        info() {
                            const container = document.createElement("div");
                            const overloadsContainer = document.createElement("p");
                            const keywordsContainer = document.createElement("p");
                            const keywords = document.createElement("code");
                            keywords.append(result.item.keywords.join(" "));
                            keywordsContainer.append("Keywords: ", keywords);
                            overloadsContainer.append(result.item.overloads);
                            container.append(keywordsContainer, overloadsContainer);
                            return container;
                        },
                        boost: 99 * (1 - (result.score ?? 0)),
                        type: "method",
                    };
                }),
                update: (current, from, to, context) => this.elementAutocomplete(context),
            };
        }
        return null;
    }
    autocomplete(context: CompletionContext): CompletionResult | null {
        const sugar = context.matchBefore(/#[,.^](.)/);
        if (sugar != null) {
            const desugared = sugarTrigraphs[sugar.text];
            if (typeof desugared == "string") {
                return {
                    from: sugar.from,
                    filter: false,
                    options: [
                        { label: desugared, detail: "sugar trigraph", type: "keyword" }
                    ]
                };
            }
        }
        if (context.explicit && this.elements != null) {
            const word = context.matchBefore(/[a-zA-Z].*/);
            if (word != null) {
                return this.elementAutocomplete(context);
            }
        }
        return null;
    }
    // Highlighting stuff
    startState(): VyxalState {
        return { mode: Mode.Normal };
    }
    token(stream: StringStream, state: VyxalState): string | null {
        switch (state.mode) {
            case Mode.VariableOp:
                stream.eatWhile(VARIABLE_NAME);
                state.mode = Mode.Normal;
                return "variableName";
            case Mode.LambdaArgs:
                if (stream.eat("!")) {
                    state.mode = Mode.Normal;
                    return "keyword";
                }
                if (stream.eat("|")) {
                    state.mode = Mode.Normal;
                    return "separator";
                }
                if (stream.eat("*")) {
                    return "keyword";
                }
                if (stream.match(/0|[1-9][0-9]*/) || stream.match(VARIABLE_NAME)) {
                    return "propertyName";
                }
                break;
            case Mode.Normal:
                if (stream.eat("'")) {
                    stream.next();
                    return "string.special";
                }
                if (stream.eat("ᶴ")) {
                    stream.next();
                    stream.next();
                    return "string.special";
                }
                if (stream.eat("~")) {
                    stream.next();
                    stream.next();
                    return "number.special";
                }
                if (stream.eat("#")) {
                    if (stream.eat("#")) {
                        stream.skipToEnd();
                        return "comment";
                    }
                    if (stream.eat(/[[\]{]/)) return "bracket";
                    if (stream.eat(/[.,^:]/)) {
                        stream.next();
                        return "macroName";
                    }
                    if (stream.eat("$")) {
                        state.mode = Mode.VariableOp;
                        return "variableName";
                    }
                    if (stream.eat("=")) {
                        state.mode = Mode.VariableOp;
                        return "definitionOperator";
                    }
                    if (stream.eat(">")) {
                        state.mode = Mode.VariableOp;
                        return "definitionOperator.special";
                    }
                    if (stream.eat(/[[\]$!=#>@{]/)) {
                        return "invalid";
                    }
                    return "propertyName.function.special";
                }
                if (stream.eat(/[∆øÞk]/)) {
                    stream.next();
                    return "propertyName.function.special";
                }
                if (stream.eat(MODIFIER)) {
                    return "modifier";
                }
                if (stream.eat(/[[{(ḌṆλƛΩ₳µ⟨]/)) {
                    return "bracket";
                }
                if (stream.eat(/}\)]⟩/)) {
                    return "bracket";
                }
                if (stream.eat("|")) {
                    return "separator";
                }
                if (stream.match(/¤(0|[1-9][0-9]*)/)) {
                    return "controlKeyword";
                }
                if (stream.match(NUMBER)) {
                    return "number";
                }
                if (stream.match(STRING)) {
                    return "string";
                }
        }
        stream.next();
        return "content";
    }
}

export default function () {
    return new LanguageSupport(
        StreamLanguage.define(new VyxalLanguage())
    );
}