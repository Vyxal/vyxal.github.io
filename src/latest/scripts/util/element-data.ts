import Fuse from "fuse.js";
import { createContext } from "react";

export type Element = {
    type: "element",
    name: string,
    symbol: string,
    keywords: string[],
    overloads: string[],
    vectorises: boolean,
};

export type Modifier = {
    type: "modifier",
    name: string,
    symbol: string,
    description: string,
    keywords: string[],
    overloads: string[],
};

export type SyntaxFeature = {
    type: "syntax",
    name: string,
    symbol: string,
    description: string,
    usage: string,
};

export type SyntaxThing = Element | Modifier | SyntaxFeature;

export type BooleanFlagDef = {
    type: "boolean",
    name: string,
    flag: string,
};

export type ChoiceFlagDef = {
    type: "choice",
    name: string,
    default: string,
    choices: Map<string, string>,
};

export type FlagDefs = Map<string, BooleanFlagDef | ChoiceFlagDef>;

type RawChoiceFlagDef = {
    type: "choice",
    name: string,
    default: string,
    choices: { [key: string]: string },
};

export type ElementData = {
    elements: Map<string, Element>,
    elementsByKeyword: Map<string, Element>,
    modifiers: Map<string, Modifier>,
    modifiersByKeyword: Map<string, Modifier>,
    syntax: Map<string, SyntaxFeature>,
    sugars: Map<string, string>,
    codepage: Set<string>,
    codepageRaw: string[],
    flagDefs: Map<string, BooleanFlagDef | ChoiceFlagDef>,
    version: string,
};
type RawElementData = {
    elements: Omit<Element, "type">[],
    modifiers: Omit<Modifier, "type">[],
    syntax: Omit<SyntaxFeature, "type">[],
    sugars: object,
    codepage: string,
    flags: (BooleanFlagDef | RawChoiceFlagDef)[],
    version: string,
};

// @ts-expect-error DATA_URI gets replaced by Webpack
export const ELEMENT_DATA: Promise<ElementData> = fetch(`${DATA_URI}/theseus.json`)
    .then((response) => response.json())
    .then((data: RawElementData): ElementData => {
        const elements: Element[] = data.elements.map((element) => ({ type: "element", ...element }));
        const modifiers: Modifier[] = data.modifiers.map((modifier) => ({ type: "modifier", ...modifier }));
        const syntax: SyntaxFeature[] = data.syntax.map((syntax) => ({ type: "syntax", ...syntax }));
        return {
            elements: new Map(elements.map((element) => [element.symbol, element])),
            elementsByKeyword: new Map(elements.flatMap((element) => element.keywords.map((keyword) => [keyword, element]))),
            modifiers: new Map(modifiers.map((modifier) => [modifier.symbol, modifier])),
            modifiersByKeyword: new Map(modifiers.flatMap((modifier) => modifier.keywords.map((keyword) => [keyword, modifier]))),
            syntax: new Map(syntax.map((syntax) => [syntax.symbol, syntax])),
            sugars: new Map(Object.entries(data.sugars)),
            codepage: new Set([...data.codepage, " ", "\n"]),
            codepageRaw: [...data.codepage],
            flagDefs: new Map(data.flags.map((def) => def.type == "choice" ? {...def, choices: new Map(Object.entries(def.choices))} : def).map((def) => [def.name, def])),
            version: data.version,
        };
    });

export const ElementDataContext = createContext<ElementData | undefined>(undefined);

export const elementFuse = new Fuse<Element>([], {
    includeScore: true,
    threshold: 0.3,
    isCaseSensitive: true,
    keys: [
        {
            "name": "symbol",
            "weight": 3,
        },
        {
            "name": "name",
            "weight": 2,
        },
        {
            "name": "keywords",
            "weight": 1,
        },
    ],
});
export const modifierFuse = new Fuse<Modifier>([], {
    includeScore: true,
    threshold: 0.3,
    isCaseSensitive: true,
    keys: [
        {
            "name": "name",
            "weight": 2,
        },
        {
            "name": "keywords",
            "weight": 1,
        },
    ],
});
export const syntaxFuse = new Fuse<SyntaxFeature>([], {
    includeScore: true,
    threshold: 0.3,
    isCaseSensitive: true,
    keys: [
        {
            "name": "symbol",
            "weight": 3,
        },
        {
            "name": "name",
            "weight": 2,
        },
    ],
});
ELEMENT_DATA.then((data) => {
    elementFuse.setCollection([...data.elements.values()]);
    modifierFuse.setCollection([...data.modifiers.values()]);
    syntaxFuse.setCollection([...data.syntax.values()]);
});
