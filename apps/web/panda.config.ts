import { defineConfig, defineSemanticTokens, defineTokens } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import olive from "@park-ui/panda-preset/colors/olive";

const accent = {
  name: "accent",
  tokens: defineTokens.colors({
    light: {
      "1": { value: "#2F80ED" },
    },
    dark: {
      "1": { value: "#2F80ED" },
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
  conditions: {
    extend: {
      dark: '.dark &, [data-theme="dark"] &',
      light: '.light &, [data-theme="light"] &',
    },
  },
  theme: {
    extend: {
      tokens: {
        colors: {
          // 旧カラー（互換性のため残す）
          sidebarBg: {
            value: "#292f3b",
          },
          font: {
            value: "#292f3b",
          },
          subfont: {
            value: "#6e6863",
          },
          accent: {
            value: "#2F80ED",
          },
        },
        shadows: {
          card: {
            value: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
          },
          cardHover: {
            value: "0 4px 12px rgba(0, 0, 0, 0.10)",
          },
          float: {
            value: "0 4px 24px rgba(0, 0, 0, 0.08)",
          },
        },
        radii: {
          card: {
            value: "12px",
          },
          button: {
            value: "8px",
          },
        },
      },
      semanticTokens: {
        colors: {
          // ブランドカラー
          brand: {
            gradient: {
              value: {
                base: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
                _dark: "linear-gradient(135deg, #4299E1 0%, #3182CE 100%)",
              },
            },
            light: {
              value: {
                base: "#56CCF2",
                _dark: "#4299E1",
              },
            },
            primary: {
              value: {
                base: "#2F80ED",
                _dark: "#3182CE",
              },
            },
            dark: {
              value: {
                base: "#1E5BB8",
                _dark: "#2C5282",
              },
            },
            DEFAULT: {
              value: {
                base: "#2F80ED",
                _dark: "#3182CE",
              },
            },
          },
          // 背景色 — ライト=白、ダーク=黒
          bg: {
            base: {
              value: {
                base: "#FFFFFF",
                _dark: "#09090B",
              },
            },
            card: {
              value: {
                base: "#F4F4F5",
                _dark: "#18181B",
              },
            },
            overlay: {
              value: {
                base: "rgba(0, 0, 0, 0.4)",
                _dark: "rgba(0, 0, 0, 0.7)",
              },
            },
          },
          // 入力エリア背景
          inputAreaBg: {
            value: {
              base: "#FAFAFA",
              _dark: "#18181B",
            },
          },
          // ボーダー
          border: {
            subtle: {
              value: {
                base: "#E4E4E7",
                _dark: "#27272A",
              },
            },
          },
          // テキスト
          text: {
            primary: {
              value: {
                base: "#09090B",
                _dark: "#FAFAFA",
              },
            },
            secondary: {
              value: {
                base: "#71717A",
                _dark: "#A1A1AA",
              },
            },
            muted: {
              value: {
                base: "#A1A1AA",
                _dark: "#52525B",
              },
            },
          },
        },
      },
    },
  },
  include: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  jsxFramework: "react",
  outdir: "styled-system",
  globalCss: {
    "html, body": {
      minHeight: "100dvh",
      backgroundColor: "bg.base",
      color: "text.primary",
      transition: "background-color 0.3s ease, color 0.3s ease",
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
    // モード切替アニメーション
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
