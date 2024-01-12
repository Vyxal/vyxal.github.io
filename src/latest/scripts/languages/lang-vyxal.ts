import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { LanguageSupport, StreamLanguage, StreamParser, StringStream, syntaxTree } from "@codemirror/language";

import type { ElementData } from "../util/element-data";
import { UtilWorker } from "../util/util-worker";
import { renderToStaticMarkup } from 'react-dom/server';
import { ModifierCard } from "../cards/ModifierCard";
import { ElementCard } from "../cards/ElementCard";
import { VARIABLE_NAME, VARIABLE_LIST, NUMBER, NUMBER_PART, elementAutocomplete, LanguageData } from './common';
import type { SyntaxNode } from "@lezer/common";
import { hoverTooltip, Tooltip } from "@codemirror/view";
import { MapMode } from "@codemirror/state";

enum Mode {
    Normal,
    VariableOp,
    String,
    LambdaArgs,
    CustomDefinitionName,
    CustomDefinitionArgs,
    RecordDefinitionName,
    ExtensionMethodName,
    ExtensionMethodArgName,
    ExtensionMethodArgType,
}

type VyxalState = {
    mode: Mode,
};

class VyxalLanguage implements StreamParser<VyxalState> {
    util: UtilWorker;
    elementData: ElementData;
    constructor(util: UtilWorker, elementData: ElementData) {
        this.util = util;
        this.elementData = elementData;
    }
    name = "vyxal3";
    languageData: LanguageData = {
        commentTokens: {
            line: "##",
        },
        autocomplete: this.autocomplete.bind(this),
    };
    autocomplete(context: CompletionContext): Promise<CompletionResult | null> {
        const sugar = context.matchBefore(/#[,.^](.)/);
        if (sugar != null) {
            const desugared = this.elementData.sugars.get(sugar.text);
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
    }
    elementTooltip = hoverTooltip((view, pos) => {
        if (syntaxTree(view.state).cursorAt(pos).name != "Document") {
            return null;
        }
        const hoveredChar = view.state.doc.sliceString(pos, pos + 1);
        if (this.elementData.elementMap.has(hoveredChar)) {
            const element = this.elementData.elementMap.get(hoveredChar)!;
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
        if (this.elementData.modifierMap.has(hoveredChar)) {
            const modifier = this.elementData.modifierMap.get(hoveredChar)!;
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
    });

    private makeStringTooltip(view, node: SyntaxNode): Promise<HTMLElement | null> {
        if (node.name != "string") {
            return Promise.resolve(null);
        }
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
                    },
                };
            }
            return null;
        });
    });

    // Highlighting stuff
    startState(): VyxalState {
        return { mode: Mode.Normal };
    }
    token = function(stream: StringStream, state: VyxalState): string | null {
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
            case Mode.CustomDefinitionName:
                if (stream.eat(/[*@]/)) {
                    state.mode = Mode.CustomDefinitionArgs;
                    if (stream.match(VARIABLE_NAME)) {
                        return "variableName.definition";
                    } else {
                        return "keyword.special";
                    }
                }
                break;
            case Mode.CustomDefinitionArgs:
                if (stream.eat("|")) {
                    return "separator";
                } else if (stream.eatWhile(VARIABLE_LIST)) {
                    state.mode = Mode.Normal;
                    return "variableName.definition";
                }
                break;

            case Mode.RecordDefinitionName:
                if (stream.eat("|")) {
                    state.mode = Mode.Normal;
                    return "separator";
                } else if (stream.match(VARIABLE_NAME)) {
                    return "variableName.definition";
                }
                break;

            case Mode.ExtensionMethodName:
                if (stream.match(VARIABLE_NAME)) {
                    return "variableName.definition";
                }
                if (stream.eat("|")) {
                    state.mode = Mode.ExtensionMethodArgName;
                    return "separator";
                }
                break;
            case Mode.ExtensionMethodArgName:
                if (stream.eat("|")) {
                    state.mode = Mode.ExtensionMethodArgType;
                    return "separator";
                } else if (stream.match(VARIABLE_NAME)) {
                    return "variableName.definition";
                }
                break;
            case Mode.ExtensionMethodArgType:
                if (stream.eat("|")) {
                    state.mode = Mode.ExtensionMethodArgName;
                    return "separator";
                } else if (stream.match(VARIABLE_NAME)) {
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
                    if (stream.eat(/[[\]{]/)) {
                        return "bracket";
                    }
                    if (stream.eat(/[.,^]/)) {
                        stream.next();
                        return "macroName";
                    }
                    if (stream.eat("::")) {
                        state.mode = Mode.CustomDefinitionName;
                        return "keyword";
                    }
                    if (stream.eat(":R")) {
                        state.mode = Mode.RecordDefinitionName;
                        return "keyword";
                    }
                    if (stream.eat(":>>")) {
                        state.mode = Mode.ExtensionMethodName;
                        return "keyword";
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
                    if (stream.eat(":@")) {
                        state.mode = Mode.VariableOp;
                        return "definitionOperator.special";
                    }
                    if (stream.eat(":`")) {
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
                if (stream.eat((char) => this.elementData.modifierMap.has(char))) {
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
    }.bind(this); // why is this a thing that I have to do
}

export default function(util: UtilWorker, data: ElementData) {
    const instance = new VyxalLanguage(util, data);
    return new LanguageSupport(
        StreamLanguage.define(instance), [instance.elementTooltip, instance.stringTooltip]
    );
}