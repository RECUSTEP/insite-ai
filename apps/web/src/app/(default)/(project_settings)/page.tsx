import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ComponentProps } from "react";
import { ProjectInfoForm } from "./_components/project-info-form";
import { Flex, HStack } from "styled-system/jsx";
import { ProjectInfoFormWithSelector } from "./_components/project-info-form-with-selector";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProjectDeleteModalButton } from "./_components/project-delete-modal-button";

export const metadata: Metadata = {
  title: "プロジェクト設定",
};

export default async function Page() {
  const client = createClient();
  const projectRes = await client.project.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  const projectsRes = await client.projects.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  const projectInfoRes = await client.project_info.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (
    !projectRes.ok &&
    projectRes.status !== 404 &&
    !projectsRes.ok &&
    projectsRes.status !== 404 &&
    !projectInfoRes.ok &&
    projectInfoRes.status !== 404
  ) {
    throw new Error("Failed to fetch project info");
  }

  let defaultValue: ComponentProps<typeof ProjectInfoForm>["defaultValue"] = undefined;
  if (projectInfoRes.ok) {
    defaultValue = await projectInfoRes.json();
  }
  if (!projectRes.ok) {
    throw new Error("Failed to fetch current project");
  }
  if (!projectsRes.ok) {
    throw new Error("Failed to fetch projects");
  }

  const currentProject = await projectRes.json();
  const projects = await projectsRes.json();

  return (
    <Flex gap={8} direction={"column"}>
      <Flex justify="space-between">
        <Text as="h1" size="xl">
          プロジェクト設定
        </Text>
        <Link href="/new" scroll={false}>
          <Button>プロジェクト新規作成</Button>
        </Link>
      </Flex>
      <ProjectInfoFormWithSelector
        defaultValue={defaultValue}
        selectedProjectId={currentProject.projectId}
        projects={projects}
      />
      <HStack ml="auto">
        <ProjectDeleteModalButton projectId={currentProject.projectId} />
      </HStack>
    </Flex>
  );
}
