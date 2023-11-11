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
  "root": {
    "type": "column",
    "content": [
      {
        "type": "stack",
        "content": [
          {
            "type": "component",
            "content": [],
            "size": "10%",
            "id": "",
            "maximised": false,
            "isClosable": true,
            "reorderEnabled": true,
            "title": "Flags",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Flags",
            "componentState": {}
          },
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": true,
            "reorderEnabled": true,
            "title": "Code",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "MainCode",
            "componentState": {}
          },
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": true,
            "reorderEnabled": true,
            "title": "Header",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Header",
            "componentState": {}
          },
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": true,
            "reorderEnabled": true,
            "title": "Footer",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Footer",
            "componentState": {}
          },
        ],
        "size": "55.55555555555556%",
        "id": "",
        "isClosable": true,
        "maximised": false,
      },
      {
        "type": "row",
        "content": [
          {
            "type": "stack",
            "content": [
              {
                "type": "component",
                "content": [],
                "size": "40%",
                "id": "",
                "maximised": false,
                "isClosable": true,
                "reorderEnabled": true,
                "title": "Inputs",
                "header": {
                  "show": "top",
                  "popout": false,
                  "maximise": false
                },
                "componentType": "Inputs",
                "componentState": {}
              }
            ],
            "size": "50%",
            "id": "",
            "isClosable": true,
            "maximised": false,
          },
          {
            "type": "stack",
            "content": [
              {
                "type": "component",
                "content": [],
                "size": "60%",
                "id": "",
                "maximised": false,
                "isClosable": true,
                "reorderEnabled": true,
                "title": "Output",
                "header": {
                  "show": "top",
                  "popout": false,
                  "maximise": false
                },
                "componentType": "Output",
                "componentState": {}
              }
            ],
            "size": "50%",
            "id": "",
            "isClosable": true,
            "maximised": false,
            "activeItemIndex": 0
          }
        ],
        "size": "44.44444444444444%",
        "id": "",
        "isClosable": true
      }
    ],
    "size": "1fr",
    "id": "",
    "isClosable": true
  },
};


export const defaultMobileLayout: LayoutConfig = {
  "dimensions": {
    "defaultMinItemHeight": "1000px",
  },
  "root": {
    "type": "column",
    "content": [
      {
        "type": "stack",
        "content": [
          {
            "type": "component",
            "content": [],
            "size": "25%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": false,
            "title": "Flags",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Flags",
            "componentState": {}
          },
        ],
        "size": "25%",
        "id": "",
        "isClosable": false,
        "maximised": false,
      },
      {
        "type": "stack",
        "content": [
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": false,
            "title": "Header",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Header",
            "componentState": {}
          },
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": false,
            "title": "Code",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "MainCode",
            "componentState": {}
          },
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": false,
            "title": "Footer",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Footer",
            "componentState": {}
          }
        ],
        "size": "100%",
        "id": "",
        "isClosable": false,
        "maximised": false,
        "activeItemIndex": 2
      },
      {
        "type": "stack",
        "content": [
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": false,
            "title": "Inputs",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Inputs",
            "componentState": {}
          }
        ],
        "size": "100%",
        "id": "",
        "isClosable": false,
        "maximised": false,
        "activeItemIndex": 0
      },
      {
        "type": "stack",
        "content": [
          {
            "type": "component",
            "content": [],
            "size": "100%",
            "id": "",
            "maximised": false,
            "isClosable": false,
            "reorderEnabled": true,
            "title": "Output",
            "header": {
              "show": "top",
              "popout": false,
              "maximise": false
            },
            "componentType": "Output",
            "componentState": {}
          }
        ],
        "size": "100%",
        "id": "",
        "isClosable": false,
        "maximised": false,
        "activeItemIndex": 0
      }
    ],
    "size": "1fr",
    "id": "",
    "isClosable": true
  }
}