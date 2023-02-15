/// <reference types="vite/client" />

declare const Vyxal: {
  execute(
    code: string,
    inputs: string,
    flags: string,
    callback: (res: string) => void
  ): void;

  getSBCSified(code: string): string;

  getCodepage(): string;
};
