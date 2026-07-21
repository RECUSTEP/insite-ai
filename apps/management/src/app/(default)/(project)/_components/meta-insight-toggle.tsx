"use client";

import { useState } from "react";
import { css } from "styled-system/css";
import { toggleMetaInsightAction } from "../_actions/toggle-meta-insight";

function getStatusLabel(enabled: boolean, globalEnabled: boolean | null) {
  if (!enabled) {
    return "Meta OFF";
  }
  if (globalEnabled === true) {
    return "Meta ON";
  }
  return globalEnabled === false ? "Meta PJ ON・全体 OFF" : "Meta PJ ON・全体不明";
}

function getSuccessMessage(enabled: boolean, globalEnabled: boolean | null) {
  if (!enabled) {
    return "Meta インサイト（Instagram・Threads）を無効化しました。ユーザー画面を再読み込みしてください。";
  }
  if (globalEnabled === false) {
    return "プロジェクト設定をONにしましたが、全体設定がOFFのためユーザー画面ではまだ利用できません。アプリケーション設定もONにしてください。";
  }
  return "Meta インサイト（Instagram・Threads）を有効化しました。ユーザー画面を再読み込みしてください。";
}

interface MetaInsightToggleProps {
  projectId: string;
  initialEnabled: boolean;
  globalEnabled: boolean | null;
}

export function MetaInsightToggle({
  projectId,
  initialEnabled,
  globalEnabled,
}: MetaInsightToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const isEffective = enabled && globalEnabled === true;
  const statusLabel = getStatusLabel(enabled, globalEnabled);

  const handleToggle = async () => {
    const newState = !enabled;
    const confirmed = window.confirm(
      `Meta インサイト（Instagram・Threads）を${newState ? "有効化" : "無効化"}しますか？`,
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const result = await toggleMetaInsightAction(projectId, newState);
      if (result.success) {
        setEnabled(newState);
        alert(getSuccessMessage(newState, globalEnabled));
      } else {
        alert(`エラー: ${result.error || "更新に失敗しました"}`);
      }
    } catch {
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
        ...(isEffective
          ? {
              bg: "purple.50",
              color: "purple.700",
              borderColor: "purple.200",
              _hover: {
                bg: "purple.100",
                borderColor: "purple.300",
              },
            }
          : enabled
            ? {
                bg: "orange.50",
                color: "orange.700",
                borderColor: "orange.200",
                _hover: {
                  bg: "orange.100",
                  borderColor: "orange.300",
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
      title={
        enabled && globalEnabled === false
          ? "プロジェクト設定はONですが、Metaの全体設定がOFFのため利用できません"
          : undefined
      }
    >
      {loading ? "更新中..." : statusLabel}
    </button>
  );
}
