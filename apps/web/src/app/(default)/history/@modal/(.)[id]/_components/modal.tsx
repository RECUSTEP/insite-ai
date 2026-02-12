"use client";

import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Stack } from "styled-system/jsx";

export type ModalProps = {
  title: string;
  children: React.ReactNode;
};

export function Modal({ title, children }: ModalProps) {
  const router = useRouter();

  return (
    <Dialog.Root defaultOpen onExitComplete={() => router.back()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content minW="0" maxW="4xl" mx={2} maxH="90dvh" overflow="auto">
          <Stack gap="8" p="8">
            <Dialog.Title>{title}</Dialog.Title>
            {children}
          </Stack>
          <Dialog.CloseTrigger asChild position="absolute" top="4" right="4">
            <IconButton aria-label="ダイアログを閉じる" variant="ghost" size="sm">
              <XIcon />
            </IconButton>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
