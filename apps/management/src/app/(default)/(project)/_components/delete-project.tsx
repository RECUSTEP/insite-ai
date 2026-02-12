import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import type { projectSchema } from "api/schema";
import { XIcon } from "lucide-react";
import { Stack } from "styled-system/jsx";
import type { z } from "zod";
import { DeleteProjectForm } from "./delete-project-form";

type Project = z.infer<typeof projectSchema>;

type Props = {
  children: React.ReactNode;
  project: Project;
};

export function DeleteProject({ children, project }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger color="red" cursor="pointer" asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Stack gap="8" p="6">
            <Stack gap="1">
              <Dialog.Title>プロジェクトを削除</Dialog.Title>
              <Dialog.Description>
                一度削除したプロジェクトは元に戻すことができません。
              </Dialog.Description>
            </Stack>
            <DeleteProjectForm project={project} />
          </Stack>
          <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
            <IconButton aria-label="ダイアログを閉じる" variant="ghost" size="sm">
              <XIcon />
            </IconButton>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
