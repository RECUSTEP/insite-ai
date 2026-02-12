"use client";

import { Center } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { Flex } from "styled-system/jsx";
import { ProjectInfoForm } from "./project-info-form";
import { projectInfoSchema } from "api/schema";
import { z } from "zod";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

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
