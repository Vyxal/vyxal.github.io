import { syntaxTree } from "@codemirror/language";
import { combineConfig, EditorState, Facet, Range, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";
import { EditorView } from "codemirror";

const theme = EditorView.baseTheme({
    "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
    "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" },
    "&:not(.cm-focused) .cm-eofMarker": { display: "none" },
    ".cm-eofMarker": { display: "inline" },
});

const matchingMark = Decoration.mark({class: "cm-matchingBracket"});
const nonmatchingMark = Decoration.mark({class: "cm-nonmatchingBracket"});

class EOFWidget extends WidgetType {
    eq() {
        return true;
    }
    toDOM(): HTMLElement {
        const element = document.createElement("span");
        element.classList.add("cm-eofMarker");
        element.classList.add("cm-placeholder");
        element.classList.add("cm-matchingBracket");
        element.textContent = "␄";
        return element;
    }
}

const eofWidget = Decoration.widget({
    widget: new EOFWidget(),
    side: 1,
});

const enum Side {
    FORWARDS = 1, BACKWARDS = -1,
}

type MatchResult = { 
    matched: true,
    start: SyntaxNode[],
    end: SyntaxNode | null,
} | {
    matched: false,
    highlight: SyntaxNode,
} | null;

export type BracketMatchingConfig = {
    showEof: boolean,
};

const bracketMatchingConfig = Facet.define<BracketMatchingConfig, Required<BracketMatchingConfig>>({
    combine(configs) {
        return combineConfig(configs, {
            showEof: false,
        });
    },
});

function matchBrackets(state: EditorState, position: number, side: Side): MatchResult {
    const tree = syntaxTree(state);
    const startNode = tree.resolveInner(position, side);
    if (startNode.type.name == "StructureOpen") {
        const iter = tree.cursorAt(position, side);
        let depth = 0;
        do {
            if (iter.name == "StructureClose") {
                const closer = state.doc.sliceString(iter.from, iter.to);
                if (closer == "}") {
                    depth--;
                } else if (closer == ")") {
                    depth -= 2;
                } else if (closer == "]") {
                    depth = 0;
                }
                if (depth <= 0) {
                    return { matched: true, start: [startNode], end: iter.node };
                }
            } else if (iter.name == "StructureOpen") {
                depth++;
            }
        } while (iter.next(true));
        return { matched: true, start: [startNode], end: null };
    } else if (startNode.type.name == "StructureClose") {
        let openers: SyntaxNode[] = [];
        tree.iterate({
            enter(node) {
                if (node.name == "StructureClose") {
                    const closer = state.doc.sliceString(node.from, node.to);
                    if (closer == "}") {
                        openers.splice(openers.length - 2);
                    } else if (closer == ")") {
                        openers.pop();
                    } else if (closer == "]") {
                        openers = [];
                    }
                } else if (node.name == "StructureOpen") {
                    openers.push(node.node);
                }
            },
            from: 0,
            to: startNode.from - 1,
        });
        const closer = state.doc.sliceString(startNode.from, startNode.to);
        if (closer == "}") {
            if (openers.length >= 1) {
                return { matched: true, start: [openers.pop()!], end: startNode };
            }
        } else if (closer == ")") {
            if (openers.length >= 2) {
                return { matched: true, start: openers.splice(openers.length - 2), end: startNode };
            }
        } else if (closer == "]") {
            if (openers.length > 0) {
                return { matched: true, start: openers, end: startNode };
            }
        } else {
            throw new Error(`Unexpected StructureClose ${closer}`);
        }
        return { matched: false, highlight: startNode };
    }
    return null;
}

const bracketMatchingState = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(decorationSet, transaction) {
        if (!transaction.docChanged && !transaction.selection) {
            return decorationSet;
        }
        const decorations: Range<Decoration>[] = [];
        const config = transaction.state.facet(bracketMatchingConfig);
        for (const range of transaction.state.selection.ranges) {
            if (!range.empty) {
                continue;
            }
            const match = matchBrackets(transaction.state, range.head, Side.FORWARDS) ?? matchBrackets(transaction.state, range.head, Side.BACKWARDS);
            if (match) {
                if (match.matched) {
                    match.start.map((node) => decorations.push(matchingMark.range(node.from, node.to)));
                    if (match.end) {
                        decorations.push(matchingMark.range(match.end.from, match.end.to));
                    } else if (config.showEof) {
                        decorations.push(eofWidget.range(transaction.state.doc.length));
                    }
                } else {
                    decorations.push(nonmatchingMark.range(match.highlight.from, match.highlight.to));
                }
            } 
        }
        return Decoration.set(decorations, true);
    },
    provide: (f) => EditorView.decorations.from(f),
});

export function vyxalBracketMatching(config: BracketMatchingConfig) {
    return [bracketMatchingConfig.of(config), theme, bracketMatchingState];
}