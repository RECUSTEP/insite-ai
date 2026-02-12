"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Stack } from "styled-system/jsx";
import { DeleteProjectForm } from "./delete-project-form";

export function ProjectDeleteModalButton(props: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button colorPalette="red" size="sm" onClick={() => setIsOpen(true)}>
        プロジェクトを削除
      </Button>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content minW="md">
            <Stack gap="8" p="6">
              <Dialog.Title>プロジェクト削除確認</Dialog.Title>
              <DeleteProjectForm projectId={props.projectId} onCompleted={() => setIsOpen(false)} />
            </Stack>
            <Dialog.CloseTrigger asChild position="absolute" top="4" right="4">
              <IconButton aria-label="ダイアログを閉じる" variant="ghost" size="sm">
                <XIcon />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
