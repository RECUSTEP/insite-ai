"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { css } from "styled-system/css";
import { logout } from "../_action/logout";

export function Logout() {
  return (
    <Button
      variant="outline"
      onClick={async () => await logout()}
      className={css({
        color: "text.secondary",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: "transparent",
        _hover: {
          bg: { base: "#F4F4F5", _dark: "#27272A" },
          color: "text.primary",
          borderColor: { base: "#D4D4D8", _dark: "#3F3F46" },
        },
      })}
    >
      <LogOutIcon />
      ログアウト
    </Button>
  );
}
