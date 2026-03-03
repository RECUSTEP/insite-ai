"use client";

import { Button } from "@/components/ui/button";
import { authSchema } from "@repo/module/service";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { css } from "styled-system/css";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";
import type { z } from "zod";
import type { projectSchema } from "api/schema";
import { DeleteAuth } from "../../auth/_components/delete-auth";
import { DeleteProject } from "./delete-project";
import { SeoAddonToggle } from "./seo-addon-toggle";

type Project = z.infer<typeof projectSchema>;
type Auth = z.infer<typeof authSchema>;

export type AuthWithProjects = {
  id: string;
  projects: Project[];
};

type Props = {
  authWithProjects: AuthWithProjects[];
};

export function AuthProjectTree({ authWithProjects }: Props) {
  if (authWithProjects.length === 0) {
    return (
      <Box
        py={16}
        textAlign="center"
        color="fg.muted"
        fontSize="sm"
      >
        アカウントが見つかりませんでした
      </Box>
    );
  }

  return (
    <Stack gap={3}>
      {authWithProjects.map((auth) => (
        <AuthNode key={auth.id} auth={auth} />
      ))}
    </Stack>
  );
}

function AuthNode({ auth }: { auth: AuthWithProjects }) {
  const [expanded, setExpanded] = useState(true);

  const authForDelete: Auth = { id: auth.id, password: "" };

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="12px"
      overflow="hidden"
      bg="bg.card"
    >
      {/* Auth header row */}
      <Flex
        align="center"
        px={4}
        py={3}
        bg="bg.base"
        borderBottom={expanded && auth.projects.length > 0 ? "1px solid" : "none"}
        borderColor="border.subtle"
        gap={3}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={css({
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "fg.muted",
            _hover: { color: "fg.default" },
          })}
        >
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>

        <HStack gap={2} flex={1} minW={0}>
          <KeyRoundIcon size={16} className={css({ color: "blue.500", flexShrink: 0 })} />
          <span
            className={css({
              fontWeight: 600,
              fontSize: "sm",
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
          >
            {auth.id}
          </span>
          <span
            className={css({
              fontSize: "xs",
              color: "fg.muted",
              bg: "bg.subtle",
              px: 2,
              py: 0.5,
              borderRadius: "full",
              flexShrink: 0,
            })}
          >
            {auth.projects.length} PJ
          </span>
        </HStack>

        <HStack gap={2} flexShrink={0}>
          <Button asChild size="xs" variant="outline">
            <Link href={`/new?authId=${encodeURIComponent(auth.id)}`}>
              <PlusIcon size={12} />
              PJ追加
            </Link>
          </Button>
          <Link
            href={`/auth/${encodeURIComponent(auth.id)}`}
            className={css({
              display: "flex",
              alignItems: "center",
              p: 1.5,
              borderRadius: "md",
              color: "fg.muted",
              _hover: { color: "fg.default", bg: "bg.subtle" },
            })}
          >
            <PencilIcon size={14} />
          </Link>
          <DeleteAuth auth={authForDelete}>
            <span
              className={css({
                display: "flex",
                alignItems: "center",
                p: 1.5,
                borderRadius: "md",
                color: "red.500",
                cursor: "pointer",
                _hover: { bg: "red.50" },
              })}
            >
              <TrashIcon size={14} />
            </span>
          </DeleteAuth>
        </HStack>
      </Flex>

      {/* Projects */}
      {expanded && auth.projects.length > 0 && (
        <Stack gap={0} divideY="1px" divideColor="border.subtle">
          {auth.projects.map((project) => (
            <ProjectRow key={project.projectId} project={project} />
          ))}
        </Stack>
      )}

      {expanded && auth.projects.length === 0 && (
        <Box px={10} py={3} fontSize="xs" color="fg.muted">
          プロジェクトなし —{" "}
          <Link
            href={`/new?authId=${encodeURIComponent(auth.id)}`}
            className={css({ color: "blue.500", _hover: { textDecoration: "underline" } })}
          >
            プロジェクトを追加
          </Link>
        </Box>
      )}
    </Box>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Flex
      align="center"
      px={4}
      pl={10}
      py={3}
      gap={3}
      _hover={{ bg: "bg.subtle" }}
      transition="background 0.15s"
    >
      <FolderIcon size={14} className={css({ color: "amber.500", flexShrink: 0 })} />

      <Box flex={1} minW={0}>
        <HStack gap={3} flexWrap="wrap">
          <span
            className={css({
              fontWeight: 500,
              fontSize: "sm",
              color: "text.primary",
            })}
          >
            {project.name}
          </span>
          <span
            className={css({
              fontSize: "xs",
              color: "fg.muted",
              fontFamily: "mono",
            })}
          >
            {project.projectId}
          </span>
          <span className={css({ fontSize: "xs", color: "fg.muted" })}>
            担当: {project.managerName}
          </span>
          <span className={css({ fontSize: "xs", color: "fg.muted" })}>
            オーナー: {project.ownerName}
          </span>
          <span className={css({ fontSize: "xs", color: "fg.muted" })}>
            API: {project.apiUsageLimit}/月
          </span>
          <SeoAddonToggle
            projectId={project.projectId}
            initialEnabled={project.seoAddonEnabled ?? false}
          />
        </HStack>
      </Box>

      <HStack gap={1} flexShrink={0}>
        <Link
          href={`/projects/${encodeURIComponent(project.projectId)}`}
          className={css({
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: "md",
            color: "fg.muted",
            _hover: { color: "fg.default", bg: "bg.subtle" },
          })}
        >
          <PencilIcon size={14} />
        </Link>
        <DeleteProject project={project}>
          <span
            className={css({
              display: "flex",
              alignItems: "center",
              p: 1.5,
              borderRadius: "md",
              color: "red.500",
              cursor: "pointer",
              _hover: { bg: "red.50" },
            })}
          >
            <TrashIcon size={14} />
          </span>
        </DeleteProject>
      </HStack>
    </Flex>
  );
}
