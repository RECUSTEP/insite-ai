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
        color: "text.primary",
        borderColor: {
          base: "gray.300",
          _dark: "gray.600",
        },
        bg: {
          base: "white",
          _dark: "gray.700",
        },
        _hover: {
          bg: {
            base: "gray.100",
            _dark: "gray.600",
          },
          borderColor: {
            base: "gray.400",
            _dark: "gray.500",
          },
        },
      })}
    >
      <LogOutIcon />
      ログアウト
    </Button>
  );
}
