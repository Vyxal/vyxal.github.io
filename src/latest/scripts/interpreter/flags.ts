import type { FlagDefs } from "./element-data";

export type Flags = Map<string, boolean | string>;

export function deserializeFlags(flagDefs: FlagDefs, flags: Set<string>) {
    const flagVals: Flags = new Map();

    // really lazy algorithm, doesn't do any validation
    for (const def of flagDefs.values()) {
        switch (def.type) {
            case "boolean": {
                flagVals.set(def.name, flags.has(def.flag));
                break;
            }
            case "choice": choice: {
                for (const flag of flags) {
                    if (def.choices.has(flag)) {
                        flagVals.set(def.name, def.choices.get(flag)!);
                        break choice;
                    }
                }
                flagVals.set(def.name, def.choices.get(def.default)!);
                break;
            }
        }
    }
    return flagVals;
}

export function serializeFlags(flagDefs: FlagDefs, flagVals: Map<string, string | boolean>) {
    const flags = new Set<string>();
    
    for (const def of flagDefs.values()) {
        if (!flagVals.has(def.name)) {
            throw new Error(`No value provided for ${def.name}`);
        }
        switch (def.type) {
            case "boolean": {
                if (flagVals.get(def.name)! == true) {
                    flags.add(def.flag);
                }
                break;
            }
            case "choice": {
                const choice = flagVals.get(def.name)!;
                const flag = [...def.choices.entries()].find((entry) => entry[1] == choice)?.[0];
                if (!(typeof choice == "string" && typeof flag == "string")) {
                    throw new Error(`Invalid value ${choice} for flag ${def.name}`);
                }
                if (flag != "") {
                    flags.add(flag);
                }
                break;
            }
        }
    }
    return flags;
}