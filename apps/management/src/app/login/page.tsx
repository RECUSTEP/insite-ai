import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <main
      className={css({
        display: "grid",
        placeItems: "center",
        height: "100dvh",
        px: 4,
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
    </main>
  );
}
