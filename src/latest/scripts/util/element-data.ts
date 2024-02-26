import Fuse from "fuse.js";
import { createContext } from "react";

export type Element = {
    name: string,
    symbol: string,
    keywords: string[],
    overloads: string[],
    vectorises: boolean,
};

export type Modifier = {
    name: string,
    symbol: string,
    description: string,
    keywords: string[],
    overloads: string[],
};

export type SyntaxFeature = {
    name: string,
    symbol: string,
    description: string,
    usage: string,
};

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
    elements: Element[],
    elementMap: Map<string, Element>,
    modifiers: Modifier[],
    modifierMap: Map<string, Modifier>,
    syntax: SyntaxFeature[],
    sugars: Map<string, string>,
    codepage: Set<string>,
    codepageRaw: string[],
    flagDefs: Map<string, BooleanFlagDef | ChoiceFlagDef>,
    version: string,
};
type RawElementData = {
    elements: Element[],
    modifiers: Modifier[],
    syntax: SyntaxFeature[],
    sugars: object,
    codepage: string,
    flags: (BooleanFlagDef | RawChoiceFlagDef)[],
    version: string,
};

// @ts-expect-error DATA_URI gets replaced by Webpack
export const ELEMENT_DATA: Promise<ElementData> = fetch(DATA_URI)
    .then((response) => response.json())
    .then((data: RawElementData): ElementData => {
        return {
            elements: data.elements,
            elementMap: new Map(data.elements.map((element) => [element.symbol, element])),
            modifiers: data.modifiers,
            modifierMap: new Map(data.modifiers.map((modifier) => [modifier.symbol, modifier])),
            syntax: data.syntax,
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
    elementFuse.setCollection(data.elements);
    modifierFuse.setCollection(data.modifiers);
    syntaxFuse.setCollection(data.syntax);
});
