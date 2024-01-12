export enum EndPrintMode {
    Default, TopJoinNewlines, TopJoinSpaces, TopSquish,
    Sum, DeepSum,
    LogicalNot,
    MaximumTop, MinimumTop, LengthTop,
    StackLength, StackSum, StackJoinSpaces,
    Force, None,
}


export interface ChangeFlagValue {
    type: "setting",
    setting: string,
    value: unknown,
}

export interface ChangeFlags {
    type: "flag",
    flags: string[],
}

export type FlagsAction = ChangeFlagValue | ChangeFlags;

const DEFAULT_SENTINEL = "<default>";

export const END_PRINT_MODES = new Map([
    [DEFAULT_SENTINEL, EndPrintMode.Default],
    ["j", EndPrintMode.TopJoinNewlines],
    ["s", EndPrintMode.Sum],
    ["d", EndPrintMode.DeepSum],
    ["¬", EndPrintMode.LogicalNot],
    ["O", EndPrintMode.None],
    ["o", EndPrintMode.Force],
    ["!", EndPrintMode.StackLength],
    ["G", EndPrintMode.MaximumTop],
    ["g", EndPrintMode.MinimumTop],
    ["S", EndPrintMode.TopJoinSpaces],
    ["N", EndPrintMode.TopSquish],
    ["Ṫ", EndPrintMode.StackSum],
    ["ṡ", EndPrintMode.StackJoinSpaces],
]);
export const END_PRINT_NAMES = new Map([
    [DEFAULT_SENTINEL, "Default"],
    ["j", "Join top of stack with newlines"],
    ["s", "Sum top of stack"],
    ["d", "Flatten and sum top of stack"],
    ["¬", "Logical NOT of top of stack"],
    ["O", "Do nothing"],
    ["o", `"Force"`],
    ["!", "Length of stack"],
    ["G", "Maximum of top of stack"],
    ["g", "Minimum of top of stack"],
    ["S", "Top of stack joined by spaces"],
    ["N", "Top of stack concatenated"],
    ["Ṫ", "Sum of stack"],
    ["ṡ", "Stack joined by spaces"],
]);
export const END_PRINT_FLAGS = new Map(Array.from(END_PRINT_MODES, a => [a[1], a[0]]));

export interface InterpreterFlagSettings {
    flags: string[],
    presetStack: boolean,
    startRangeAtZero: boolean,
    offsetRangeByOne: boolean,
    literate: boolean,
    rangify: boolean,
    fullTrace: boolean,
    limitPrint: boolean,
    dontEvalInputs: boolean,
    endPrintMode: EndPrintMode,
    defaultArity: 1 | 2 | 3,
}

export const INITIAL_FLAGS: InterpreterFlagSettings = {
    flags: [],
    presetStack: false,
    startRangeAtZero: false,
    offsetRangeByOne: false,
    literate: false,
    rangify: false,
    fullTrace: false,
    limitPrint: false,
    dontEvalInputs: false,
    endPrintMode: EndPrintMode.Default,
    defaultArity: 1,
};

export function settingsFromFlags(flags: string[]) {
    const settings = {
        ...INITIAL_FLAGS,
        flags: flags.filter((flag) => flag != DEFAULT_SENTINEL),
    };
    for (const flag of flags) {
        switch (flag) {
            case "H":
                settings.presetStack = true;
                break;
            case "M":
                settings.startRangeAtZero = true;
                break;
            case "m":
                settings.offsetRangeByOne = true;
                break;
            case "Ṁ":
                settings.startRangeAtZero = true;
                settings.offsetRangeByOne = true;
                break;
            case "l":
                settings.literate = true;
                break;
            case "R":
                settings.rangify = true;
                break;
            case "X":
                settings.fullTrace = true;
                break;
            case "…":
                settings.limitPrint = true;
                break;
            case "Ṡ":
                settings.dontEvalInputs = true;
                break;
            case "2":
                settings.defaultArity = 2;
                break;
            case "3":
                settings.defaultArity = 3;
                break;
            default:
                if (END_PRINT_MODES.has(flag)) {
                    settings.endPrintMode = END_PRINT_MODES.get(flag) ?? EndPrintMode.Default;
                }
        }
    }
    return settings;
}

export function flagsReducer(settings: InterpreterFlagSettings, action: FlagsAction) {
    switch (action.type) {
        case "setting":
            settings.flags = [];
            if (action.setting == "endPrintMode") {
                settings.endPrintMode = END_PRINT_MODES.get(action.value as string) ?? EndPrintMode.Default;
            } else {
                settings[action.setting] = action.value;
            }
            if (settings.presetStack) {
                settings.flags.push("H");
            }
            if (settings.startRangeAtZero && settings.offsetRangeByOne) {
                settings.flags.push("Ṁ");
            } else if (settings.startRangeAtZero) {
                settings.flags.push("M");
            } else if (settings.offsetRangeByOne) {
                settings.flags.push("m");
            }
            if (settings.literate) {
                settings.flags.push("l");
            }
            if (settings.rangify) {
                settings.flags.push("R");
            }
            if (settings.fullTrace) {
                settings.flags.push("X");
            }
            if (settings.limitPrint) {
                settings.flags.push("…");
            }
            if (settings.dontEvalInputs) {
                settings.flags.push("Ṡ");
            }
            if (settings.defaultArity != 1) {
                settings.flags.push(settings.defaultArity.toString());
            }
            if (settings.endPrintMode != EndPrintMode.Default) {
                settings.flags.push(END_PRINT_FLAGS.get(settings.endPrintMode)!);
            }
            break;
        case "flag":
            settings = settingsFromFlags(action.flags);
            break;
    }
}