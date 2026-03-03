"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#0f172a", color: "#f8fafc" }}>
        <div
          style={{
            height: "100dvh",
            display: "grid",
            placeContent: "center",
            placeItems: "center",
            gap: "1.5rem",
            padding: "1.5rem",
          }}
        >
          <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            致命的なエラーが発生しました
          </p>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", textAlign: "center" }}>
            ページを再読み込みするか、時間をおいてから再度お試しください。
          </p>
          {error.message && (
            <pre
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                padding: "1rem",
                maxWidth: "36rem",
                width: "100%",
                fontSize: "0.75rem",
                color: "#94a3b8",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {error.message}
              {error.digest ? `\n\n診断ID: ${error.digest}` : ""}
            </pre>
          )}
          <button
            onClick={() => reset()}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
