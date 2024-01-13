import { LanguageSupport, StreamLanguage, StreamParser, StringStream } from "@codemirror/language";
import { NUMBER, VARIABLE_LIST, NUMBER_PART, VARIABLE_NAME, KEYWORD, elementAutocomplete, LanguageData } from "./common";
import type { Element, ElementData } from "../util/element-data";
import { UtilWorker } from "../util/util-worker";
import type { CompletionContext } from "@codemirror/autocomplete";

// Data is accurate as of Dec 19 2023
const endKeywords = new Set([
    "endfor",
    "end-for",
    "endwhile",
    "end-while",
    "endlambda",
    "end-lambda",
    "end",
    "close-all",
    "end-all",
    "end-end",
]);

const branchKeywords = new Set([
    ":",
    "->",
    "else:",
    "else",
    "elif",
    "else-if",
    "body",
    "do",
    "branch",
    "then",
    "in",
    "using",
    "no?",
    "=>",
    "from",
    "as",
    "with",
    "given",
    ":and:",
    "has",
    "does",
    "using",
    "on",
]);

const lambdaOpeners = new Set([
    "lambda",
    "lam",
    "map-lambda",
    "map-lam",
    "map<",
    "filter-lambda",
    "filter-lam",
    "filter<",
    "sort-lambda",
    "sort-lam",
    "sort<",
    "reduce-lambda",
    "reduce-lam",
    "reduce<",
    "fold-lambda",
    "fold-lam",
    "fold<",
]);

const structOpeners = new Set([
    "yes?",
    "if",
    "for",
    "for<",
    "do-to-each",
    "each-as",
    "while",
    "while<",
    "exists<",
    "relation<",
    "generate-from<",
    "generate<",
]);

enum Structure {
    String, RawSbcs, VarUnpack, VarOp, Group, ModGroup, Lambda, LambdaArgs, List, Record, ExtensionMethod, Definition, ElementName, VariableName
}

type VyxalLitState = {
    structStack: Structure[],
};

class VyxalLitLanguage implements StreamParser<VyxalLitState> {
    elements: Element[] = [];
    util: UtilWorker;
    elementData: ElementData;
    modifierKeywords: Set<string>;
    constructor(util: UtilWorker, elementData: ElementData) {
        this.util = util;
        this.elementData = elementData;
        this.modifierKeywords = new Set(this.elementData.modifiers.flatMap((m) => m.keywords));
    }
    name: "vyxal3-lit";
    languageData: LanguageData = {
        commentTokens: {
            line: "##",
        },
        autocomplete: this.autocomplete.bind(this),
    };

    autocomplete(context: CompletionContext) {
        return elementAutocomplete(context, true);
    }

    // highlighting
    startState(): VyxalLitState {
        return { structStack: [] };
    }
    token = function (stream: StringStream, state: VyxalLitState): string | null {
        const currentStruct = state.structStack.at(-1);
        switch (currentStruct) {
            case Structure.ElementName: {
                stream.eatSpace();
                if (stream.eat("@")) {
                    state.structStack.push(Structure.LambdaArgs)
                    if (stream.match(VARIABLE_NAME)) {
                        return "variableName.definition";
                    } else {
                        return "keyword.special";
                    }
                } else if (stream.eat("*")) {
                    state.structStack.push(Structure.LambdaArgs)
                    state.structStack.push(Structure.LambdaArgs)
                    if (stream.match(VARIABLE_NAME)) {
                        return "variableName.definition";
                    } else {
                        return "keyword.special";
                    }
                } else {
                    state.structStack.push(Structure.VariableName)
                    state.structStack.push(Structure.VariableName)
                }
            }
                break;
            case Structure.VariableName:
                if (stream.match(VARIABLE_NAME)) {
                    state.structStack.pop();
                    return "variableName.definition";
                } else if (stream.eat("}")) {
                    // Pop all remaining variable name structures
                    while (state.structStack.at(-1) != Structure.VariableName) {
                        state.structStack.pop();
                    }
                    // and then the extension method structure
                    state.structStack.pop();
                } else {
                    stream.next();
                    return "invalid";
                }
                break;
            case Structure.Group:
            case Structure.ModGroup:
            case Structure.Lambda:
            case Structure.List:
            case Structure.Record:
            case Structure.ExtensionMethod:
            case Structure.Definition:
            case undefined: {
                if (currentStruct == Structure.Group || currentStruct == Structure.ModGroup) {
                    if (stream.eat(")")) {
                        state.structStack.pop();
                        return "bracket";
                    }
                }
                if (currentStruct == Structure.Lambda || currentStruct == Structure.Definition || currentStruct == Structure.ExtensionMethod || currentStruct == Structure.Record) {
                    if (stream.eat("}")) {
                        state.structStack.pop();
                        return "bracket";
                    }
                }
                if (currentStruct == Structure.List) {
                    if (stream.eat(",")) {
                        stream.eatSpace();
                        return "punctuation";
                    }
                    if (stream.eat("]")) {
                        state.structStack.pop();
                        return "bracket";
                    }
                }
                const match = stream.match(KEYWORD);
                if (match instanceof Array) {
                    const kw = match[0];
                    if (endKeywords.has(kw) || branchKeywords.has(kw) || structOpeners.has(kw)) {
                        return "controlKeyword";
                    }
                    if (lambdaOpeners.has(kw)) {
                        return "definitionKeyword";
                    }
                    if (this.modifierKeywords.has(kw)) {
                        return "modifier";
                    }
                    return "content";
                }
                if (stream.eatSpace()) {
                    return "";
                }
                if (stream.match(NUMBER)) {
                    return "number";
                }
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
                    state.structStack.push(Structure.String);
                    return "string";
                }
                if (stream.eat("#")) {
                    if (stream.eat("#")) {
                        stream.skipToEnd();
                        return "comment";
                    }
                    if (stream.eat("[")) {
                        state.structStack.push(Structure.VarUnpack);
                        return "operatorKeyword";
                    }
                    state.structStack.push(Structure.RawSbcs);
                    return "meta";
                }
                if (stream.eat("{")) {
                    state.structStack.push(Structure.Lambda);
                    state.structStack.push(Structure.LambdaArgs);
                    return "definitionKeyword";
                }
                if (stream.eat("[")) {
                    state.structStack.push(Structure.List);
                    return "bracket";
                }
                if (stream.eat("$")) {
                    state.structStack.push(Structure.VarOp);
                    return "operator";
                }
                if (stream.match(":=")) {
                    state.structStack.push(Structure.VarOp);
                    return "updateOperator";
                }
                if (stream.match(/`(0|[1-9][0-9]*)`/)) {
                    return "controlKeyword";
                }
                if (stream.eat("(")) {
                    if (stream.match(/(\.|,|:[.: ]|;[,; ])/)) {
                        state.structStack.push(Structure.ModGroup);
                        return "keyword.special";
                    }
                    state.structStack.push(Structure.Group);
                    return "bracket";
                }
                if (stream.eat("define")) {
                    state.structStack.push(Structure.ElementName);
                    state.structStack.push(Structure.LambdaArgs)
                    state.structStack.push(Structure.Definition);
                    return "keyword";
                }
                if (stream.eat("record")) {
                    state.structStack.push(Structure.Record);
                    return "keyword";
                }
                if (stream.match("extension")) {
                    state.structStack.push(Structure.ExtensionMethod);
                    return "keyword";
                }
                if (stream.eat("$@")) {
                    if (stream.match(VARIABLE_NAME)) {
                        return "definitionOperator.special";
                    }
                }
                if (stream.eat("$:")) {
                    if (stream.match(VARIABLE_NAME)) {
                        return "definitionOperator.special";
                    }
                }
                stream.next();
                return "invalid";
            }
            case Structure.String: {
                stream.eatWhile(/[^"„”“]/);
                stream.next();
                state.structStack.pop();
                return "string";
            }
            case Structure.RawSbcs: {
                if (stream.match(/#}/)) {
                    state.structStack.pop();
                    return "meta";
                }
                stream.next();
                return "content";
            }
            case Structure.VarUnpack: {
                if (!stream.eat("[")) {
                    if (stream.eatWhile("]")) {
                        state.structStack.pop();
                        return "operatorKeyword";
                    }
                    if (stream.match(VARIABLE_NAME)) {
                        return "variableName";
                    }
                }
                stream.next();
                return "invalid";
            }
            case Structure.VarOp: {
                if (stream.match(VARIABLE_NAME)) {
                    state.structStack.pop();
                    return "variableName";
                }
                stream.next();
                return "invalid";
            }
            case Structure.LambdaArgs: {
                if (stream.eat("!")) {
                    state.structStack.pop();
                    return "keyword.special";
                }
                if (stream.eat("*")) {
                    return "keyword.special";
                }
                if (stream.match(NUMBER_PART) || stream.match(VARIABLE_NAME)) {
                    return "variableName.definition";
                }
                const kw = stream.match(KEYWORD);
                if (kw instanceof Array && branchKeywords.has(kw[0])) {
                    state.structStack.pop();
                    return "keyword";
                }
                state.structStack.pop();
                return "";
            }
        }
        stream.next();
        return "content";
    }.bind(this);
}

export default function (util: UtilWorker, elementData: ElementData) {
    const instance = new VyxalLitLanguage(util, elementData);
    return new LanguageSupport(
        StreamLanguage.define(instance),
    );
}