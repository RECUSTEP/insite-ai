import type { ApplicationSettingUseCase, ProjectUseCase } from "@repo/module/service";
import { metaFeatureFlagsFromSettings } from "./meta-feature-flags";

export const META_INSIGHT_DISABLED_MESSAGE =
  "Meta インサイト機能はこのプロジェクトで無効です";

type MetaInsightAccessContext = {
  var: {
    applicationSettingUseCase: ApplicationSettingUseCase<"d1">;
    projectUseCase: ProjectUseCase<"d1">;
  };
};

export type MetaInsightAccessStatus =
  | { ok: true }
  | { ok: false; status: 400 | 403; message: string };

export async function getMetaInsightAccessStatus(
  c: MetaInsightAccessContext,
  projectId: string,
): Promise<MetaInsightAccessStatus> {
  const projectResult = await c.var.projectUseCase.getProject({ projectId });
  if (!projectResult.ok) {
    return { ok: false, status: 400, message: projectResult.val };
  }

  const appSettingsResult = await c.var.applicationSettingUseCase.getApplicationSetting();
  const globalMetaFlags = appSettingsResult.ok
    ? metaFeatureFlagsFromSettings(appSettingsResult.val)
    : {
        metaInsightEnabled: false,
        metaSocialChatEnabled: false,
        metaAccountLinkEnabled: false,
      };

  if (!globalMetaFlags.metaInsightEnabled || !(projectResult.val.metaInsightEnabled ?? false)) {
    return { ok: false, status: 403, message: META_INSIGHT_DISABLED_MESSAGE };
  }

  return { ok: true };
}
