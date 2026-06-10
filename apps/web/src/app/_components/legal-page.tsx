import Link from "next/link";
import { css } from "styled-system/css";

type LegalPageProps = {
  title: string;
  body: string;
};

export function LegalPage({ title, body }: LegalPageProps) {
  return (
    <main
      className={css({
        minH: "100dvh",
        bg: { base: "#F8FAFC", _dark: "#09090B" },
        color: { base: "#18181B", _dark: "#FAFAFA" },
        px: { base: "4", md: "8" },
        py: { base: "8", md: "12" },
      })}
    >
      <article
        className={css({
          maxW: "900px",
          mx: "auto",
          bg: { base: "white", _dark: "#18181B" },
          borderWidth: "1px",
          borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          rounded: "lg",
          shadow: "sm",
          overflow: "hidden",
        })}
      >
        <header
          className={css({
            px: { base: "5", md: "8" },
            py: { base: "5", md: "7" },
            borderBottomWidth: "1px",
            borderColor: { base: "#E4E4E7", _dark: "#27272A" },
          })}
        >
          <h1
            className={css({
              fontSize: { base: "2xl", md: "3xl" },
              fontWeight: 700,
              lineHeight: 1.3,
            })}
          >
            {title}
          </h1>
          <nav
            className={css({
              display: "flex",
              flexWrap: "wrap",
              gap: "4",
              mt: "4",
              fontSize: "sm",
            })}
          >
            <Link
              href="/terms"
              className={css({
                color: { base: "#2563EB", _dark: "#60A5FA" },
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              })}
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className={css({
                color: { base: "#2563EB", _dark: "#60A5FA" },
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              })}
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/login"
              className={css({
                color: { base: "#71717A", _dark: "#A1A1AA" },
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
              })}
            >
              ログインへ戻る
            </Link>
          </nav>
        </header>
        <div
          className={css({
            px: { base: "5", md: "8" },
            py: { base: "6", md: "8" },
            fontSize: { base: "sm", md: "md" },
            lineHeight: 1.9,
            color: { base: "#3F3F46", _dark: "#D4D4D8" },
            whiteSpace: "pre-wrap",
          })}
        >
          {body}
        </div>
      </article>
    </main>
  );
}
