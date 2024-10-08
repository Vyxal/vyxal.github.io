declare module "*.txt" {
    let content: string;
    export = content;
}
declare module "*.txt?raw" {
    let content: string;
    export = content;
}
declare module "*.png" {
    const url: string;
    export = url;
}
declare module "*.json" {
    const url: string;
    export = url;
}
declare module "*.json?raw" {
    const content: string;
    export = content;
}
declare module "*.handlebars.md" {
    const content: string;
    export = content;
}
declare module "*.grammar" {
    const parser: import("@lezer/lr").LRParser;
    export = parser;
}
declare module "*.vyl?raw" {
    const content: string;
    export = content;
}