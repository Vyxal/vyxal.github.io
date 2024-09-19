export enum Theme {
    Dark, Light,
}

export type Settings = {
    theme: Theme,
    literateByDefault: boolean,
    snowing: "yes" | "no" | "always",
    highlightBrackets: "yes" | "yes-eof" | "no",
};

type SettingsRaw = Omit<Settings, "theme"> & { theme: keyof typeof Theme };

const defaultSettings: SettingsRaw = {
    theme: "Dark",
    literateByDefault: false,
    snowing: "yes",
    highlightBrackets: "yes",
};


export function isTheSeason() {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    start.setMonth(11, 1);
    end.setFullYear(now.getFullYear() + 1, 1, 1);
    if (now.getTime() > start.getTime() && now.getTime() < end.getTime()) {
        return true;
    }
    return false;
}

export function loadSettings(): Settings {
    let localSettings: SettingsRaw;
    try {
        localSettings = {
            ...defaultSettings,
            ...JSON.parse(localStorage.getItem("settings") ?? "{}"),
        };
    } catch (e) {
        console.warn("Failed to parse settings!", e);
        localSettings = defaultSettings;
    }
    return {
        ...localSettings,
        theme: Theme[localSettings.theme],
    };
}

export function saveSettings(settings: Settings) {
    localStorage.setItem("settings", JSON.stringify({
        ...settings,
        theme: Theme[settings.theme],
    } as SettingsRaw));
}