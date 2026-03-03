"use client";

export default function GlobalError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
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
          <p style={{ fontSize: "0.875rem", color: "#6b7280", textAlign: "center" }}>
            ページを再読み込みするか、管理者に連絡してください。
          </p>
          {error.message && (
            <pre
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                padding: "1rem",
                maxWidth: "42rem",
                width: "100%",
                fontSize: "0.75rem",
                color: "#475569",
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
              background: "#1e293b",
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
