import { LanguageSupport } from "@codemirror/language";
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { elementAutocomplete, elementTooltip } from "./common";
import { ElementData } from "../util/element-data";
import { vyxalLitLanguage } from "../../../common/scripts/languages/vyxal-lit";

export function vyxalLitCompletion() {
    return vyxalLitLanguage.data.of({
        autocomplete(context: CompletionContext): Promise<CompletionResult | null> {
            return elementAutocomplete(context, true);
        },
    });
}

export function vyxalLit(data: ElementData) {
    return new LanguageSupport(vyxalLitLanguage, [vyxalLitCompletion(), elementTooltip(data, true)]);
}