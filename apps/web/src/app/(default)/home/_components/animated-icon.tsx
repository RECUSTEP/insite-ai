"use client";

import type { LucideIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

type AnimationVariant = "orbit" | "relay" | "wave" | "spark" | "loop";

interface AnimatedIconProps {
  variant: AnimationVariant;
  icon: LucideIcon;
  color: string;
  size?: number;
}

/**
 * Bentoスタイルのアニメーションアイコンラッパー
 * 5種類のアニメーションバリアントをサポート
 */
export function AnimatedIcon({ variant, icon: Icon, color, size = 64 }: AnimatedIconProps) {
  return (
    <Box
      className={css({
        position: "relative",
        width: size,
        height: size,
        borderRadius: "full",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        isolation: "isolate",
      })}
    >
      {/* 外側のボーダーリング（装飾用） */}
      <Box
        className={css({
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          border: "1px solid",
          borderColor: "rgba(148, 163, 184, 0.2)",
          opacity: 0.4,
          pointerEvents: "none",
        })}
      />

      {/* 中央のアイコン */}
      <Icon
        size={size / 2}
        className={css({
          position: "relative",
          zIndex: 2,
          color: color,
        })}
      />

      {/* バリアント別のアニメーション要素 */}
      {variant === "orbit" && <OrbitAnimation />}
      {variant === "relay" && <RelayAnimation />}
      {variant === "wave" && <WaveAnimation />}
      {variant === "spark" && <SparkAnimation />}
      {variant === "loop" && <LoopAnimation />}
    </Box>
  );
}

/**
 * Orbit: 回転する光のライン
 */
function OrbitAnimation() {
  return (
    <Box
      className={css({
        position: "absolute",
        height: "140%",
        width: "3px",
        background: "linear-gradient(180deg, transparent, currentColor 55%, transparent)",
        transformOrigin: "center",
        animation: "iconOrbit 8s linear infinite",
        opacity: 0.6,
        pointerEvents: "none",
      })}
    />
  );
}

/**
 * Relay: 水平に流れるダッシュライン
 */
function RelayAnimation() {
  return (
    <Box
      className={css({
        position: "absolute",
        inset: "18px",
        borderTop: "1px solid currentColor",
        borderBottom: "1px solid currentColor",
        transform: "skewX(-15deg)",
        opacity: 0.5,
        overflow: "hidden",
        pointerEvents: "none",
      })}
    >
      {/* 上のダッシュ */}
      <Box
        className={css({
          position: "absolute",
          top: 0,
          height: "1px",
          width: "120%",
          left: "-10%",
          background: "linear-gradient(90deg, transparent, currentColor, transparent)",
          animation: "iconDash 2.6s ease-in-out infinite",
        })}
      />
      {/* 下のダッシュ（遅延） */}
      <Box
        className={css({
          position: "absolute",
          bottom: 0,
          height: "1px",
          width: "120%",
          left: "-10%",
          background: "linear-gradient(90deg, transparent, currentColor, transparent)",
          animation: "iconDash 2.6s ease-in-out infinite",
          animationDelay: "0.9s",
        })}
      />
    </Box>
  );
}

/**
 * Wave: 波のように動くグラデーション
 */
function WaveAnimation() {
  return (
    <Box
      className={css({
        position: "absolute",
        inset: "12px",
        borderRadius: "full",
        overflow: "hidden",
        opacity: 0.4,
        pointerEvents: "none",
      })}
    >
      <Box
        className={css({
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 5%, currentColor 50%, transparent 95%)",
          animation: "iconWave 2.8s ease-in-out infinite alternate",
        })}
      />
    </Box>
  );
}

/**
 * Spark: パルス状に広がるリング
 */
function SparkAnimation() {
  return (
    <Box
      className={css({
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      })}
    >
      {/* 1つ目のパルス */}
      <Box
        className={css({
          position: "absolute",
          inset: "12px",
          borderRadius: "full",
          border: "1px solid currentColor",
          opacity: 0.28,
          animation: "iconPulse 2.8s ease-out infinite",
        })}
      />
      {/* 2つ目のパルス（遅延） */}
      <Box
        className={css({
          position: "absolute",
          inset: "12px",
          borderRadius: "full",
          border: "1px solid currentColor",
          opacity: 0.28,
          animation: "iconPulse 2.8s ease-out infinite",
          animationDelay: "0.9s",
        })}
      />
    </Box>
  );
}

/**
 * Loop: 十字に交差するライン
 */
function LoopAnimation() {
  return (
    <Box
      className={css({
        position: "absolute",
        inset: "12px",
        pointerEvents: "none",
      })}
    >
      {/* 水平ライン */}
      <Box
        className={css({
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "50%",
          left: 0,
          background: "linear-gradient(90deg, transparent, currentColor, transparent)",
          animation: "iconLoop 2s ease-in-out infinite",
        })}
      />
      {/* 垂直ライン */}
      <Box
        className={css({
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "50%",
          left: 0,
          background: "linear-gradient(90deg, transparent, currentColor, transparent)",
          transform: "rotate(90deg)",
          animation: "iconLoop 2s ease-in-out infinite",
          animationDelay: "0.5s",
          opacity: 0.6,
        })}
      />
    </Box>
  );
}
