export function getByteCount(code: string) {
  const codepage = Vyxal.getCodepage();
  const utfable = [...code].every((x) => (codepage + " " + "\n").includes(x));
  return {
    utfable,
    len: utfable ? code.length : new TextEncoder().encode(code).length,
  };
}
