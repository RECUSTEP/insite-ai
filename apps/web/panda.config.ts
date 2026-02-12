import { defineConfig, defineSemanticTokens, defineTokens } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import olive from "@park-ui/panda-preset/colors/olive";

const accent = {
  name: "accent",
  tokens: defineTokens.colors({
    light: {
      "1": { value: "#c0b385" },
    },
    dark: {
      "1": { value: "#c0b385" },
    },
  }),
  semanticTokens: defineSemanticTokens.colors({
    default: {
      value: {
        _light: "{colors.accent.light.1}",
        _dark: "{colors.accent.dark.1}",
      },
    },
    emphasized: {
      value: {
        _light: "{colors.accent.light.1}",
        _dark: "{colors.accent.dark.1}",
      },
    },
    fg: {
      value: {
        _light: "white",
        _dark: "white",
      },
    },
    text: {
      value: {
        _light: "{colors.accent.light.1}",
        _dark: "{colors.accent.dark.1}",
      },
    },
  }),
};

export default defineConfig({
  preflight: true,
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: accent,
      grayColor: olive,
      radius: "md",
    }),
  ],
  theme: {
    extend: {
      tokens: {
        colors: {
          sidebarBg: {
            value: "#292f3b",
          },
          inputAreaBg: {
            value: "#fbfbf8",
          },
          font: {
            value: "#292f3b",
          },
          subfont: {
            value: "#6e6863",
          },
          accent: {
            value: "#c0b385",
          },
        },
      },
    },
  },
  include: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  globalCss: {
    body: {
      minHeight: "100dvh",
    },
  },
});
