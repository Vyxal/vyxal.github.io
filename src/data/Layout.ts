import { ComponentItemConfig, ItemType, LayoutConfig } from "golden-layout";

export function comp(type: string, size?: string): ComponentItemConfig {
  return {
    componentType: type,
    header: { show: "top", popout: false, maximise: false },
    type: ItemType.component,
    title: (titles as any)[type],
    ...(size ? { size } : {}),
  };
}

export const titles: { [key: string]: string } = {
  Flags: "Flags",
  MainCode: "Code",
  Header: "Header",
  Footer: "Footer",
  Inputs: "Inputs",
  Output: "Output",
  CookieClicker: "🍪🍪🍪🍪🍪🍪🍪",
};

export const defaultLayout: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: ItemType.column,
        size: "100%",
        content: [
          comp("Flags", "10%"),
          {
            type: "stack",
            size: "50%",
            content: [
              comp("MainCode", "100%"),
              comp("Header", "100%"),
              comp("Footer", "100%"),
            ],
          },
          comp("Inputs", "40%"),
        ],
      },
      {
        type: ItemType.column,
        size: "100%",
        content: [comp("Output", "60%"), comp("CookieClicker", "40%")],
      },
    ],
  },
};
