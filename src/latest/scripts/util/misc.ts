export type VyRunnerState = "idle" | "starting" | "running";

export enum Theme {
    Dark, Light,
}

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

export function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme == null) {
        return Theme.Dark;
    }
    return Theme[theme as keyof typeof Theme];
}

export function loadSnowing() {
    const snowing = localStorage.getItem("snowing");
    if (snowing == "always") return true;
    if (snowing == "yes" && isTheSeason()) return true;
    return false;
}
