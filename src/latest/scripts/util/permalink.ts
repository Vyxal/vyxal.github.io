import compatRaw from "../../data/compat.json?raw";

const compat = JSON.parse(compatRaw);

export function incompatible(permalinkVersion: string) {
    return compat[permalinkVersion] ?? false;
}

export function encodeHash(header: string, code: string, footer: string, flags: string[], inputs: string[], version: string): string {
    return btoa(encodeURIComponent(JSON.stringify({
        format: 2,
        header: header,
        code: code,
        footer: footer,
        flags: flags,
        inputs: inputs,
        version: version,
    })));
}

export function decodeHash(hash: string): V2Permalink | null {
    try {
        const data = JSON.parse(decodeURIComponent(atob(hash)));
        if (data instanceof Array) {
            return ({
                format: 2,
                flags: Array.from(data[0] as string),
                header: data[1],
                code: data[2],
                footer: data[3],
                inputs: (data[4] as string).split("\n"),
                version: data[5],
            } as V2Permalink);
        } else if (data.format == 2) {
            return (data as V2Permalink);
        } else {
            console.warn("Permalink is of an unsupported format!", data);
            return null;
        }
    } catch {
        console.warn("Failed to decode permalink!");
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type V1Permalink = {
    flags: string,
    header: string,
    code: string,
    footer: string,
    inputs: string,
};

export type V2Permalink = {
    format: 2,
    flags: string[],
    header: string,
    code: string,
    footer: string,
    inputs: string[],
    version: string | undefined,
};

