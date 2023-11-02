declare const Vyxal: {
  execute(
    code: string,
    inputs: string,
    flags: string,
    callback: (res: string) => void
  ): void;

  getSBCSified(code: string): string;

  getCodepage(): string;

  getElements(): {
    keywords: string[];
    name: string;
    overloads: string[];
    symbol: string;
    vectorises: boolean;
  }[];

  getModifiers(): {
    keywords: string[];
    name: string;
    symbol: string;
    description: string;
  }[];

  compress(text: string): string;

  decompress(text: string): string;

  setShortDict(dict: string): void;

  setLongDict(dict: string): void;
};

declare const dictionary: {
  short: string;
  long: string;
};
