import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
  preflight: true,
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: "blue",
      grayColor: "olive",
      borderRadius: "md",
    }),
  ],
  theme: {
    extend: {
      tokens: {
        colors: {
          // ブランドカラー（水色→青グラデーション）
          brand: {
            gradient: {
              value: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
            },
            light: {
              value: "#56CCF2",
            },
            DEFAULT: {
              value: "#2F80ED",
            },
            dark: {
              value: "#1E5BB8",
            },
          },
          // 背景色
          bg: {
            base: {
              value: "#F0F4F8", // わずかに青みのある明るいグレー
            },
            card: {
              value: "#FFFFFF",
            },
            overlay: {
              value: "rgba(0, 0, 0, 0.4)",
            },
          },
          // テキスト
          text: {
            primary: {
              value: "#2D3748",
            },
            secondary: {
              value: "#718096",
            },
            muted: {
              value: "#A0AEC0",
            },
          },
          // アクセントカラー
          accent: {
            value: "#2F80ED",
          },
        },
        shadows: {
          card: {
            value: "0 2px 8px rgba(0, 0, 0, 0.08)",
          },
          cardHover: {
            value: "0 4px 16px rgba(47, 128, 237, 0.2)",
          },
          float: {
            value: "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
        },
        radii: {
          card: {
            value: "16px",
          },
          button: {
            value: "12px",
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
      backgroundColor: "#F0F4F8", // わずかに青みのある明るいグレー
    },
    // ページ遷移アニメーション
    "@keyframes fadeIn": {
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    // カードホバーアニメーション
    "@keyframes float": {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-8px)" },
    },
    // スライドインアニメーション
    "@keyframes slideIn": {
      from: { opacity: 0, transform: "translateX(20px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    // ローディングアニメーション
    "@keyframes bounce": {
      "0%, 80%, 100%": { transform: "scale(0)" },
      "40%": { transform: "scale(1)" },
    },
  },
});
