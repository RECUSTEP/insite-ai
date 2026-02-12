import { Table } from "@/components/ui/table";
import type { projectSchema } from "api/schema";
import { PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { HStack } from "styled-system/jsx";
import type { z } from "zod";
import { DeleteProject } from "./delete-project";

export type ProjectTableProps = {
  projects: z.infer<typeof projectSchema>[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <Table.Root variant="outline">
      <Header />
      <Table.Body>
        {projects.map((project) => (
          <Table.Row key={project.projectId}>
            <Table.Cell textAlign="center">{project.name}</Table.Cell>
            <Table.Cell textAlign="center">{project.managerName}</Table.Cell>
            <Table.Cell textAlign="center">{project.ownerName}</Table.Cell>
            <Table.Cell textAlign="center">{project.projectId}</Table.Cell>
            <Table.Cell textAlign="center">{project.authId}</Table.Cell>
            <Table.Cell textAlign="center">{project.apiUsageLimit}</Table.Cell>
            <Table.Cell maxW="min-content">
              <HStack gap={2} w="fit-content" mx="auto">
                <Link href={`/projects/${encodeURIComponent(project.projectId)}`}>
                  <PencilIcon size={18} />
                </Link>
                <DeleteProject project={project}>
                  <TrashIcon size={18} />
                </DeleteProject>
              </HStack>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function Header() {
  return (
    <Table.Head>
      <Table.Row>
        <Table.Header textAlign="center">プロジェクト名</Table.Header>
        <Table.Header textAlign="center">担当者</Table.Header>
        <Table.Header textAlign="center">オーナー</Table.Header>
        <Table.Header textAlign="center">プロジェクトID</Table.Header>
        <Table.Header textAlign="center">認証ID</Table.Header>
        <Table.Header textAlign="center">API使用可能回数/月</Table.Header>
        <Table.Header textAlign="center" maxW="min-content" />
      </Table.Row>
    </Table.Head>
  );
}
