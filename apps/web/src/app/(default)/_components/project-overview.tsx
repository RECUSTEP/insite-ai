import * as Progress from "@/components/ui/styled/progress";
import { Text } from "@/components/ui/text";
import { createClient, createFetch } from "@/lib/api";
import { PROJECT_TAG } from "@/lib/tags";
import { cookies } from "next/headers";
import { Stack } from "styled-system/jsx";

export async function ProjectOverview() {
  const fetcher = createFetch({
    next: {
      revalidate: 0,
      tags: [PROJECT_TAG],
    },
  });
  const client = createClient(fetcher);
  const response = await client.project.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch project data");
  }
  const project = await response.json();

  return (
    <Stack>
      <Text as="span" color="text.primary" fontWeight="600">
        {project.name}
      </Text>
      <Stack>
        <Stack direction="row" justify="space-between" fontSize="sm" color="text.primary" fontWeight="500">
          <span>API使用上限</span>
          <span>
            {project.apiUsageCount} / {project.apiUsageLimit}
          </span>
        </Stack>
        <Progress.Root value={project.apiUsageCount} min={0} max={project.apiUsageLimit}>
          <Progress.Track bg="gray.200">
            <Progress.Range bg="brand.DEFAULT" />
          </Progress.Track>
        </Progress.Root>
      </Stack>
    </Stack>
  );
}
