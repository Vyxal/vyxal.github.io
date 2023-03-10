import { ComponentItemConfig, ItemType, LayoutConfig } from "golden-layout";

import Output from "@/components/OutputBox.vue";
import MainCode from "@/components/MainCode.vue";
import Header from "@/components/HeaderCode.vue";
import Footer from "@/components/FooterCode.vue";
import Inputs from "@/components/InputsBox.vue";
import Flags from "@/components/FlagsBox.vue";
import CookieClicker from "@/components/CookieClicker.vue";
import TextCompressor from "@/components/TextCompressor.vue";
import Idioms from "@/components/VyxalIdioms.vue";
import type { Component } from "vue";

export const components: { [key in ComponentType]: Component } = {
  Output,
  MainCode,
  Header,
  Footer,
  Inputs,
  Flags,
  CookieClicker,
  TextCompressor,
  Idioms,
};

export const titles = {
  Flags: "Flags",
  MainCode: "Code",
  Header: "Header",
  Footer: "Footer",
  Inputs: "Inputs",
  Output: "Output",
  CookieClicker: "🍪🍪🍪🍪🍪🍪🍪",
  TextCompressor: "Compressor",
  Idioms: "Idioms",
};

export type ComponentType = keyof typeof titles;

export function comp(type: ComponentType, size?: string): ComponentItemConfig {
  return {
    componentType: type,
    header: { show: "top", popout: false, maximise: false },
    type: ItemType.component,
    title: (titles as any)[type],
    ...(size ? { size } : {}),
  };
}

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
      comp("Output", "60%"),
    ],
  },
};
