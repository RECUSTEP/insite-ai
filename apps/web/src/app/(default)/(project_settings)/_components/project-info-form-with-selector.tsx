"use client";

import { Spinner } from "@/components/ui/spinner";
import type { projectInfoSchema } from "api/schema";
import { useState } from "react";
import { Center } from "styled-system/jsx";
import { Flex } from "styled-system/jsx";
import type { z } from "zod";
import { ProjectSelector } from "../../_components/project-selector";
import { ProjectInfoForm } from "./project-info-form";

type Schema = z.infer<typeof projectInfoSchema>;
type ProjectInfoFormProps = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
  projects: { projectId: string; name: string }[];
  selectedProjectId: string;
};

export const ProjectInfoFormWithSelector = (props: ProjectInfoFormProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Flex gap={8} direction={"column"}>
      <ProjectSelector
        projects={props.projects}
        selectedProjectId={props.selectedProjectId}
        onStarted={() => setLoading(true)}
        onCompleted={() => setLoading(false)}
      />
      {loading ? (
        <Center
          inline
          position="absolute"
          transform="translate(-50%, -50%)"
          top="50%"
          insetStart="50%"
        >
          <Spinner colorPalette="gray" />
        </Center>
      ) : (
        <ProjectInfoForm defaultValue={props.defaultValue} />
      )}
    </Flex>
  );
};
