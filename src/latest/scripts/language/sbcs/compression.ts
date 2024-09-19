import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { UtilWorker } from "../../workers/util-api";
import { SyntaxNode } from "@lezer/common";

class CompressButtonWidget extends WidgetType {
    eq(): boolean {
        return true;
    }

    toDOM(): HTMLElement {
        const icon = document.createElement("i");
        icon.ariaHidden = "true";
        icon.classList.add("cm-compress-button");
        icon.classList.add("cm-placeholder");
        icon.classList.add("bi");
        icon.classList.add("bi-file-zip");
        icon.style.cursor = "pointer";
        return icon;
    }

    ignoreEvent(): boolean {
        return false;
    }
}

function insertButtons(view: EditorView) {
    const widgets: Range<Decoration>[] = [];
    for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from, to,
            enter(node) {
                const text = view.state.sliceDoc(node.from, node.to);
                if (node.name == "String" && /[^“„]$/.test(text)) {
                    widgets.push(Decoration.widget({
                        widget: new CompressButtonWidget(),
                        side: 1,
                    }).range(/["”]$/.test(text) && text.length > 1 ? node.to - 1 : node.to));
                }
            },
        });
    }
    return Decoration.set(widgets);
}

export function compressButtonPlugin(util: UtilWorker) {
    return ViewPlugin.fromClass(class {
        decorations: DecorationSet;
    
        constructor(view: EditorView) {
            this.decorations = insertButtons(view);
        }
    
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) != syntaxTree(update.state)) {
                this.decorations = insertButtons(update.view);
            }
        }
    }, {
        decorations: (v) => v.decorations,
        eventHandlers: {
            click: (event, view) => {
                const target = event.target as HTMLElement;
                if (target.classList.contains("cm-compress-button")) {
                    return toggleCompression(util, view, syntaxTree(view.state).resolveInner(view.posAtDOM(target), -1));
                }
                return false;
            },
        },
    });
}

export function toggleCompression(util: UtilWorker, view: EditorView, node: SyntaxNode) {
    if (node.name == "String") {
        let text = view.state.sliceDoc(node.from, node.to);
        view.state.doc.slice(node.from, node.to);
        const compressed = text.endsWith("”");
        if (!(compressed || text.endsWith(`"`))) {
            text += `"`;
        }
        (compressed ? util.decompress(text.slice(1, -1)) : util.compress(text)).then((r) => r.slice(1, -1)).then((result) => {
            view.dispatch({
                changes: {
                    from: node.from,
                    to: node.to,
                    insert: compressed ? `"${result}"` : `"${result}”`,
                },
            });
        });
        return true;
    }
    return false;
}