import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { vyxalLitLanguage } from "../../../../common/scripts/language/vyxal-lit";
import { ElementData } from "../../interpreter/element-data";
import { elementAutocomplete } from "../common";

export function vyxalLitCompletion(elementData: ElementData) {
    return vyxalLitLanguage.data.of({
        autocomplete(context: CompletionContext): Promise<CompletionResult | null> {
            return elementAutocomplete(elementData, context, true);
        },
    });
}