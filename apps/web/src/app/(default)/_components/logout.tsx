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
        borderColor: "gray.300",
        bg: "white",
        _hover: {
          bg: "gray.100",
          borderColor: "gray.400",
        },
      })}
    >
      <LogOutIcon />
      ログアウト
    </Button>
  );
}
