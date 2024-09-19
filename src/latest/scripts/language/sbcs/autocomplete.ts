import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { ElementData } from "../../interpreter/element-data";
import { elementAutocomplete } from "../common";
import { vyxalLanguage } from "../../../../common/scripts/language/vyxal";

export function vyxalCompletion(elementData: ElementData) {
    return vyxalLanguage.data.of({
        autocomplete(context: CompletionContext): Promise<CompletionResult | null> {
            const sugar = context.matchBefore(/#[,.^](.)/);
            if (sugar != null) {
                const desugared = elementData.sugars.get(sugar.text);
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
            return elementAutocomplete(elementData, context, false);
        },
    });
}