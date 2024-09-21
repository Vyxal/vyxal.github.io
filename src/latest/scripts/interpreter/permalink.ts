import compatRaw from "../../data/compat.json?raw";
import { gunzipString, gzipString } from "gzip-utils";

const compat = JSON.parse(compatRaw);

export type Permalink = {
    format: 2,
    flags: string[],
    header: string,
    code: string,
    footer: string,
    inputs: string[],
    version: string | undefined,
};

export function incompatible(permalinkVersion: string) {
    return compat[permalinkVersion] ?? false;
}

export function encodeHash(header: string, code: string, footer: string, flags: string[], inputs: string[], version: string): Promise<string> {
    return gzipString(JSON.stringify({
        format: 2,
        header: header,
        code: code,
        footer: footer,
        flags: flags,
        inputs: inputs,
        version: version,
    }), "base64url") as Promise<string>;
}

// escape() polyfill for legacy permalinks
// https://262.ecma-international.org/5.1/#sec-B.2.1
const ESCAPE_ALLOWED = new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@*_+-./"].map((i) => i.charCodeAt(0)));
function escape(input: string) {
    let r = "";
    if (input.length == 0) {
        return "";
    }
    for (let k = 0; k < input.length; k++) {
        const code = input.charCodeAt(k);
        if (ESCAPE_ALLOWED.has(code)) {
            r += input[k];
        } else if (code < 256) {
            r += `%${code.toString(16)}`;
        } else {
            r += `%u${code.toString(16).padStart(4, "0")}`;
        }
    }
    return r;
}

export async function decodeHash(hash: string): Promise<Permalink | null> {
    let data;
    try {
        data = JSON.parse(decodeURIComponent(atob(hash)));
        if (data instanceof Array) {
            // it's a legacy permalink, do decoding again
            data = JSON.parse(decodeURIComponent(escape(atob(hash))));
            return ({
                format: 2,
                flags: Array.from(data[0] as string),
                header: data[1],
                code: data[2],
                footer: data[3],
                inputs: (data[4] as string).split("\n"),
                version: data[5],
            } as Permalink);
        }
    } catch (e) {
        // might be a compressed permalink
        try {
            data = JSON.parse(await gunzipString(hash, "base64url", "utf8") as string);
        } catch (f) {
            console.warn("Failed to decode permalink!", e, f);
            return null;
        }
    }
    try {
        if (data.format == 2) {
            return (data as Permalink);
        } else {
            console.warn("Permalink is of an unsupported format!", data);
            return null;
        }
    } catch (e) {
        console.warn("Permalink is structured incorrectly!", data, e);
        return null;
    }
}
