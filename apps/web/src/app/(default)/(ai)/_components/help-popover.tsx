import { IconButton } from "@/components/ui/icon-button";
import { Popover } from "@/components/ui/popover";
import { createClient } from "@/lib/api";
import type { helpSchema } from "api/schema";
import { HelpCircleIcon, XIcon } from "lucide-react";
import { cookies } from "next/headers";
import { Box, Stack } from "styled-system/jsx";

type Keys = keyof typeof helpSchema.shape;
export type Props = {
  contents: { title: string; id: Keys }[];
};

export async function HelpPopover({ contents }: Props) {
  const client = createClient();
  const response = await client.helps.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch help info");
  }

  const helps = await response.json();
  const help = contents
    .filter((content) => content.id in helps)
    .map((content) => ({
      title: content.title,
      content: helps[content.id],
    }));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton aria-label="ヘルプを開く" variant="ghost" size="sm" color="fg.muted">
          <HelpCircleIcon />
        </IconButton>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content minW="xs">
          <Stack gap={4}>
            {help.map(({ title, content }) => (
              <Stack key={title} gap={1}>
                <Popover.Title color="fg.muted">{title}</Popover.Title>
                <Popover.Description color="fg.subtle">{content}</Popover.Description>
              </Stack>
            ))}
          </Stack>
          <Box position="absolute" top="1" right="1">
            <Popover.CloseTrigger asChild>
              <IconButton aria-label="ヘルプを閉じる" variant="ghost" size="xs">
                <XIcon />
              </IconButton>
            </Popover.CloseTrigger>
          </Box>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
