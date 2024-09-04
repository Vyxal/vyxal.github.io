import { LanguageSupport, LRLanguage } from "@codemirror/language";
import parser from "./vyxal-lit.grammar";
import { styleTags, tags } from "@lezer/highlight";

export const vyxalLitLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Structure: tags.controlKeyword,
                Branch: tags.controlKeyword,
                Lambda: tags.controlKeyword,
                String: tags.string,
                Number: tags.number,
                NormalKW: tags.keyword,
                ModifierKW: tags.modifier,
                VariableThing: tags.variableName,
                ListStuff: tags.literal,
                GroupStuff: tags.keyword,
                Comment: tags.comment,
            }),
        ],
    }),
});

export function vyxalLit() {
    return new LanguageSupport(vyxalLitLanguage, []);
}