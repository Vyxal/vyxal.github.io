import compat from "../../assets/compat.json?raw";

export function compatible(permalinkVersion: string) {
    console.log(compat)
    return JSON.parse(compat)[permalinkVersion] == true;
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

export function decodeHash(hash: string): V2Permalink {
    const data = JSON.parse(decodeURIComponent(atob(hash)));
    if (data.format == 2) {
        return (data as V2Permalink);
    }
    return ({
        format: 2,
        flags: Array.from(data.flags as string),
        header: data.header,
        code: data.code,
        footer: data.footer,
        inputs: (data.inputs as string).split("\n"),
        version: data.version,
    } as V2Permalink);
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

