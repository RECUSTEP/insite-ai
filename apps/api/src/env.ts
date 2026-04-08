import type {
  AdminSessionUseCase,
  AnalysisHistoryUseCase,
  AnnounceUseCase,
  ApiUsageUseCase,
  ApplicationSettingUseCase,
  AuthUseCase,
  ChatSessionUseCase,
  HelpUseCase,
  InstagramAccountUseCase,
  InstructionGuideUseCase,
  ProjectInfoUseCase,
  ProjectUseCase,
  PromptUseCase,
  SessionUseCase,
} from "@repo/module/service";

export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  META_APP_ID: string;
  META_APP_SECRET: string;
  META_REDIRECT_URI: string;
  META_CONFIG_ID: string;
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
  announceUsecase: AnnounceUseCase<"d1">;
  chatSessionUseCase: ChatSessionUseCase<"d1">;
  instagramAccountUseCase: InstagramAccountUseCase<"d1">;
};

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};
