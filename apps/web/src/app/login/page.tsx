import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import type { Metadata } from "next";
import NextLink from "next/link";
import { css } from "styled-system/css";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function LoginPage() {
  return (
    <main
      className={css({
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        height: "max-content",
        px: 4,
        pt: 8,
        pb: 20,
        position: "relative",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      })}
    >
      <div
        className={css({
          width: "full",
          maxW: "md",
          bg: "white",
          borderRadius: "2xl",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          p: 10,
        })}
      >
        <Text
          as="h1"
          size="3xl"
          textAlign="center"
          mb={2}
          className={css({
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            color: "transparent",
          })}
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          INSITE AI
        </Text>
        <Text
          size="md"
          textAlign="center"
          mb={8}
          className={css({
            color: "text.secondary",
          })}
        >
          ログイン
        </Text>
        <LoginForm />
      </div>
      <Link
        color="white"
        position="absolute"
        bottom={8}
        left="50%"
        transform="translateX(-50%)"
        asChild
        className={css({
          _hover: {
            textDecoration: "underline",
          },
        })}
      >
        <NextLink href="/announce">運営からのお知らせ</NextLink>
      </Link>
    </main>
  );
}
