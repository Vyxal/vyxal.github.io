declare module "*.txt" {
    let LongDictionary: string;
    export = LongDictionary;
}
declare module "*.png" {
    const url: string;
    export = url;
}
declare module "*.handlebars.md" {
    const content: string;
    export = content;
}