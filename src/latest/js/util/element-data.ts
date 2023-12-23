import Fuse from "fuse.js";


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

export type ElementData = {
    elements: Element[],
    elementMap: Map<string, Element>,
    modifiers: Modifier[],
    modifierMap: Map<string, Modifier>,
    syntax: SyntaxFeature[],
    sugars: Map<string, string>,
    codepage: Set<string>,
    version: string,
};
type RawElementData = {
    elements: Element[],
    modifiers: Modifier[],
    syntax: SyntaxFeature[],
    sugars: object,
    codepage: string,
    version: string,
};

export const ELEMENT_DATA: Promise<ElementData> = fetch("https://vyxal.github.io/Vyxal/theseus.json")
    .then((response) => response.json())
    .then((data: RawElementData) => {
        return {
            elements: data.elements,
            elementMap: new Map(data.elements.map((element) => [element.symbol, element])),
            modifiers: data.modifiers,
            modifierMap: new Map(data.modifiers.map((modifier) => [modifier.symbol, modifier])),
            syntax: data.syntax,
            sugars: new Map(Object.entries(data.sugars)),
            codepage: new Set([...data.codepage, " ", "\n"]),
            version: data.version,
        };
    });

export const elementFuse = new Fuse<Element>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "symbol",
            "weight": 3
        },
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ],
});
export const modifierFuse = new Fuse<Modifier>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ]
});
ELEMENT_DATA.then((data) => {
    elementFuse.setCollection(data.elements);
    modifierFuse.setCollection(data.modifiers);
});
