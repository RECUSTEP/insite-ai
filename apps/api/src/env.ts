import type {
  AdminSessionUseCase,
  AnalysisHistoryUseCase,
  ApiUsageUseCase,
  ApplicationSettingUseCase,
  HelpUseCase,
  ProjectInfoUseCase,
  ProjectUseCase,
  PromptUseCase,
  SessionUseCase,
  InstructionGuideUseCase,
  AuthUseCase,
} from "@repo/module/service";

export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
};

export type Variables = {
  authUseCase: AuthUseCase<"d1">;
  projectUseCase: ProjectUseCase<"d1">;
  apiUsageUseCase: ApiUsageUseCase<"d1">;
  analysisHistoryUseCase: AnalysisHistoryUseCase<"d1">;
  projectInfoUseCase: ProjectInfoUseCase<"d1">;
  adminSessionUseCase: AdminSessionUseCase<"d1">;
  sessionUseCase: SessionUseCase<"d1">;
  helpUseCase: HelpUseCase<"d1">;
  promptUseCase: PromptUseCase<"d1">;
  applicationSettingUseCase: ApplicationSettingUseCase<"d1">;
  instructionGuideUsecase: InstructionGuideUseCase<"d1">;
};

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};
