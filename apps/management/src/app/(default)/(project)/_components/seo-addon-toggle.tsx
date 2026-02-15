"use client";

import { useState } from "react";
import { css } from "styled-system/css";
import { toggleSeoAddonAction } from "../_actions/toggle-seo-addon";

interface SeoAddonToggleProps {
  projectId: string;
  initialEnabled: boolean;
}

export function SeoAddonToggle({ projectId, initialEnabled }: SeoAddonToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newState = !enabled;
    const confirmed = window.confirm(
      `SEO/AIOアドオンを${newState ? "有効化" : "無効化"}しますか？`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await toggleSeoAddonAction(projectId, newState);
      if (result.success) {
        setEnabled(newState);
        alert(`SEO/AIOアドオンを${newState ? "有効化" : "無効化"}しました`);
      } else {
        alert(`エラー: ${result.error || "更新に失敗しました"}`);
      }
    } catch (error) {
      alert("エラー: 更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 1.5,
        fontSize: "xs",
        fontWeight: 600,
        borderRadius: "md",
        cursor: "pointer",
        transition: "all 0.2s",
        border: "1px solid",
        opacity: loading ? 0.6 : 1,
        ...(enabled
          ? {
              bg: "blue.50",
              color: "blue.700",
              borderColor: "blue.200",
              _hover: {
                bg: "blue.100",
                borderColor: "blue.300",
              },
            }
          : {
              bg: "gray.50",
              color: "gray.600",
              borderColor: "gray.200",
              _hover: {
                bg: "gray.100",
                borderColor: "gray.300",
              },
            }),
        _disabled: {
          cursor: "not-allowed",
        },
      })}
    >
      {loading ? "更新中..." : enabled ? "ON" : "OFF"}
    </button>
  );
}
