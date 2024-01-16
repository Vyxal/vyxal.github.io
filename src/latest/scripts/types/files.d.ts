declare module "*.txt" {
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
declare module "*.handlebars.md" {
    const content: string;
    export = content;
}