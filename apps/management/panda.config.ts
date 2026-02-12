import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
  preflight: true,
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: "green",
      grayColor: "olive",
      borderRadius: "md",
      additionalColors: ["red"],
    }),
  ],
  include: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  globalCss: {
    body: {
      minHeight: "100dvh",
      color: "fg.default",
      backgroundColor: "bg.default",
    },
  },
});
