"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Toast } from "@/components/ui/toast";
import { XIcon } from "lucide-react";
import { css } from "styled-system/css";

export const toaster = Toast.createToaster({
  placement: "bottom-end",
  overlap: true,
  gap: 16,
});

export const ToastProvider = () => (
  <Toast.Toaster toaster={toaster}>
    {(toast) => (
      <Toast.Root
        key={toast.id}
        className={css({
          "&[data-type='error']": {
            outline: "1px solid",
            outlineColor: "border.error",
          },
        })}
      >
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.description}</Toast.Description>
        <Toast.CloseTrigger asChild>
          <IconButton size="sm" variant="link">
            <XIcon />
          </IconButton>
        </Toast.CloseTrigger>
      </Toast.Root>
    )}
  </Toast.Toaster>
);
