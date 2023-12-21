import type { Completion, CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import type { CommentTokens } from "@codemirror/commands";
import { LanguageSupport, StreamLanguage, StreamParser, StringStream, syntaxTree } from "@codemirror/language";

import { sugarTrigraphs } from "../sugar-trigraphs";
import { Element, ELEMENT_DATA, elementFuse, Modifier, modifierFuse, UtilWorker } from '../util';
import { renderToStaticMarkup } from 'react-dom/server';
import { ElementCard, ModifierCard } from '../cards';
import { VARIABLE_NAME, MODIFIER, NUMBER, NUMBER_PART } from './common';
import { FuseResult } from "fuse.js";
import type { SyntaxNode } from "@lezer/common";
import { hoverTooltip, Tooltip } from "@codemirror/view";
import { MapMode } from "@codemirror/state";

enum Mode {
    Normal,
    VariableOp,
    String,
    LambdaArgs
}

type VyxalState = {
    mode: Mode,
};

interface LanguageData {
    commentTokens?: CommentTokens,
    autocomplete?: CompletionSource,
}

class VyxalLanguage implements StreamParser<VyxalState> {
    elements: Element[] = [];
    util: UtilWorker;
    constructor(util: UtilWorker) {
        this.util = util;
        ELEMENT_DATA.then((data) => {
            this.elements = data.elements;
        });
    }
    name = "vyxal3";
    languageData: LanguageData = {
        commentTokens: {
            line: "##"
        },
        autocomplete: this.autocomplete.bind(this)
    };
    private elementAutocompletion(element: Element | Modifier): Completion {
        return {
            label: element.symbol,
            detail: element.name,
            info() {
                const container = document.createElement("div");
                container.innerHTML = renderToStaticMarkup("vectorises" in element ? ElementCard({ item: element }) : ModifierCard({ item: element }));
                return container;
            },
            type: "vectorises" in element ? "method" : "keyword"
        };
    }
    elementAutocomplete(context: CompletionContext): CompletionResult | null {
        const word = context.matchBefore(/[a-zA-Z-][a-zA-Z0-9_-]*/);
        if (word != null) {
            const results: FuseResult<Element | Modifier>[] = elementFuse.search(word.text).concat(modifierFuse.search(word.text));
            if (!results.length) {
                return null;
            }
            return {
                from: word.from,
                filter: false,
                options: results.map((result) => ({ ...this.elementAutocompletion(result.item), boost: 10 * (1 - (result.score ?? 0)) })),
                update: (current, from, to, context) => this.elementAutocomplete(context),
            };
        }
        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: this.elements.map(this.elementAutocompletion),
            update: (current, from, to, context) => this.elementAutocomplete(context),
        };
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
                        { label: desugared, detail: "sugar trigraph", type: "constant" }
                    ]
                };
            }
        }
        if (context.explicit) {
            return this.elementAutocomplete(context);
        }
        return null;
    }
    elementTooltip = hoverTooltip((view, pos) => {
        if (syntaxTree(view.state).cursorAt(pos).name != "Document") return null;
        const hoveredChar = view.state.doc.sliceString(pos, pos + 1);
        return (ELEMENT_DATA.then((data) => {
            if (data.elementMap.has(hoveredChar)) {
                const element = data.elementMap.get(hoveredChar)!;
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
            if (data.modifierMap.has(hoveredChar)) {
                const modifier = data.modifierMap.get(hoveredChar)!;
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
            return null;
        }));
    });

    private makeStringTooltip(view, node: SyntaxNode): Promise<HTMLElement | null> {
        if (node.name != "string") return Promise.resolve(null);
        const content = view.state.doc.slice(node.from, node.to).toString();
        switch (content.at(-1)) {
            case "\"": {
                return Promise.resolve(null);
            }
            case "„": {
                return this.util.decompress(content).then((decompressed) => {
                    const container = document.createElement("div");
                    container.innerHTML = `<b>Compressed string: </b> ${decompressed}`;
                    return container;
                });
            }
            default:
                return Promise.resolve(null);
        }
    }
    stringTooltip = hoverTooltip((view, pos) => {
        const node = syntaxTree(view.state).resolve(pos);
        return this.makeStringTooltip(view, node).then((element) => {
            if (element != null) {
                const container = document.createElement("div");
                container.appendChild(element);
                return {
                    pos: pos,
                    create: () => {
                        return {
                            dom: container,
                            update: (update) => {
                                if (update.changes.touchesRange(node.from, node.to)) {
                                    const newPos = update.changes.mapPos(pos, -1, MapMode.TrackDel);
                                    if (newPos != null) {
                                        this.makeStringTooltip(
                                            view,
                                            syntaxTree(view.state).resolve(newPos)
                                        ).then((element) => {
                                            if (element != null) {
                                                container.replaceChildren(element);
                                            }
                                        });
                                    }
                                }
                            },
                        };
                    }
                };
            }
            return null;
        });
    });


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
                    return "keyword.special";
                }
                if (stream.eat("|")) {
                    state.mode = Mode.Normal;
                    return "separator";
                }
                if (stream.eat("*")) {
                    return "keyword.special";
                }
                if (stream.match(NUMBER_PART) || stream.match(VARIABLE_NAME)) {
                    return "variableName.definition";
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
                if (stream.eat("\"")) {
                    stream.eatWhile(/[^"„”“]/);
                    stream.next();
                    return "string";
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
                if (stream.eat("λ")) {
                    if (stream.match(/^(!|[a-zA-Z0-9_*]+?)\|/, false)) {
                        state.mode = Mode.LambdaArgs;
                    }
                    return "keyword";
                }
                if (stream.eat(/[[{(ḌṆƛΩ₳µ⟨]/)) {
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
        }
        stream.next();
        return "content";
    }
}

export default function(util: UtilWorker) {
    const instance = new VyxalLanguage(util);
    return new LanguageSupport(
        StreamLanguage.define(instance), [instance.elementTooltip, instance.stringTooltip]
    );
}