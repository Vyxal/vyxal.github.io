export const dynamicLoad = async (localPath: string, url: string) => {
    console.log(`Loading ${localPath} from ${url}`);
    try {
        return await import(localPath);
    } catch {
        console.warn(`Failed to load ${localPath}, falling back to ${url}`);
        return await import(url);
    }
};

export const { Vyxal } = await dynamicLoad("../vyxal.js", "https://vyxal.github.io/Vyxal/vyxal.js");
export const { HelpText } = await dynamicLoad("../helpText.js", "https://vyxal.github.io/Vyxal/helpText.js");