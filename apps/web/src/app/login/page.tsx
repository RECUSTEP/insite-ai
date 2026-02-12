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
      })}
    >
      <div
        className={css({
          width: "full",
          maxW: "md",
        })}
      >
        <Text as="h1" size="xl" textAlign="center" mb={8}>
          ログイン
        </Text>
        <LoginForm />
      </div>
      <Link
        color="fg.muted"
        position="absolute"
        bottom={8}
        left="50%"
        transform="translateX(-50%)"
        asChild
      >
        <NextLink href="/announce">運営からのお知らせ</NextLink>
      </Link>
    </main>
  );
}
