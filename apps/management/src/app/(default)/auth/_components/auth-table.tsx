import { Table } from "@/components/ui/table";
import { authSchema } from "@repo/module/service";
import { PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { HStack } from "styled-system/jsx";
import type { z } from "zod";
import { DeleteAuth } from "./delete-auth";

export type Props = {
  authList: z.infer<typeof authSchema>[];
};

export function AuthTable({ authList }: Props) {
  return (
    <Table.Root variant="outline">
      <Header />
      <Table.Body>
        {authList.map((auth) => (
          <Table.Row key={auth.id}>
            <Table.Cell textAlign="center">{auth.id}</Table.Cell>
            <Table.Cell textAlign="center">{auth.password}</Table.Cell>
            <Table.Cell maxW="min-content">
              <HStack gap={2} w="fit-content" mx="auto">
                <Link href={`/auth/${encodeURIComponent(auth.id)}`}>
                  <PencilIcon size={18} />
                </Link>
                <DeleteAuth auth={auth}>
                  <TrashIcon size={18} />
                </DeleteAuth>
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
        <Table.Header textAlign="center">認証ID</Table.Header>
        <Table.Header textAlign="center">PASSWORD</Table.Header>
        <Table.Header textAlign="center" maxW="min-content" />
      </Table.Row>
    </Table.Head>
  );
}
