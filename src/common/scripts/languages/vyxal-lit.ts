import { LRLanguage } from "@codemirror/language";
import { styleTags, tags } from "@lezer/highlight";
import parser from "./vyxal-lit.grammar";

export const vyxalLitLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Structure: tags.controlKeyword,
                Branch: tags.controlKeyword,
                Lambda: tags.controlKeyword,
                String: tags.string,
                Number: tags.number,
                Element: tags.keyword,
                Modifier: tags.moduleKeyword,
                VariableThing: tags.variableName,
                ListStuff: tags.literal,
                GroupStuff: tags.keyword,
                Comment: tags.comment,
            }),
        ],
    }),
});