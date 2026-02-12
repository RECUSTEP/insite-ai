import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { XIcon } from "lucide-react";
import { Stack } from "styled-system/jsx";
import type { z } from "zod";
import { DeleteAuthForm } from "./delete-auth-form";
import { authSchema } from "@repo/module/service";

type Auth = z.infer<typeof authSchema>;

type Props = {
  children: React.ReactNode;
  auth: Auth;
};

export function DeleteAuth({ children, auth }: Props) {
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
              <Dialog.Title>認証情報を削除</Dialog.Title>
              <Dialog.Description>
                一度削除した認証情報は元に戻すことができません。
              </Dialog.Description>
            </Stack>
            <DeleteAuthForm auth={auth} />
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
