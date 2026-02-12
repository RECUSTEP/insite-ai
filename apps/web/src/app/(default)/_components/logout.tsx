"use client";

import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { logout } from "../_action/logout";

export function Logout() {
  return (
    <Button variant="subtle" color="white" onClick={async () => await logout()}>
      <LogOutIcon />
      ログアウト
    </Button>
  );
}
