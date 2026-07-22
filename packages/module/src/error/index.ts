export const CommonUseCaseError = {
  InvalidInput: "InvalidInput",
  UnknownError: "UnknownError",
  NotFound: "NotFound",
} as const;

export const AuthUseCaseError = {
  AuthAlreadyExists: "AuthAlreadyExists",
  AuthNotFound: "AuthNotFound",
  AuthCountFailed: "AuthCountFailed",
  AuthCreationFailed: "AuthCreationFailed",
} as const;

export const ProjectUseCaseError = {
  ProjectAlreadyExists: "ProjectAlreadyExists",
  ProjectCreationFailed: "ProjectCreationFailed",
  ProjectUpdateFailed: "ProjectUpdateFailed",
  ProjectDeletionFailed: "ProjectDeletionFailed",
  ProjectNotFound: "projectNotFound",
  ProjectCountFailed: "ProjectCountFailed",
  AuthNotFound: "AuthNotFound",
} as const;

export const ApiUsageUseCaseError = {
  ProjectNotFound: "ApiUsageProjectNotFound",
} as const;

export const CreditPurchaseUseCaseError = {
  ProjectNotFound: "CreditPurchaseProjectNotFound",
  PendingRequestAlreadyExists: "CreditPurchasePendingRequestAlreadyExists",
  RequestNotFound: "CreditPurchaseRequestNotFound",
  RequestAlreadyReviewed: "CreditPurchaseRequestAlreadyReviewed",
} as const;

export const AnalysisHistoryUseCaseError = {
  ProjectNotFound: "AnalysisHistoryProjectNotFound",
  AnalysisHistoryNotFound: "AnalysisHistoryNotFound",
} as const;

export const ProjectInfoUseCaseError = {
  ProjectNotFound: "ProjectInfoProjectNotFound",
  ProjectInfoNotFound: "ProjectInfoNotFound",
} as const;

export const SessionUseCaseError = {
  SessionCreationFailed: "SessionCreationFailed",
  SessionValidationFailed: "SessionValidationFailed",
  SessionDeletionFailed: "SessionDeletionFailed",
} as const;

export const InstructionGuideUseCaseError = {
  InstructionGuideNotFound: "InstructionGuideNotFound",
} as const;

export const AnnounceUseCaseError = {
  AnnounceNotFound: "AnnounceNotFound",
} as const;

export const ChatSessionUseCaseError = {
  ChatSessionNotFound: "ChatSessionNotFound",
  ProjectNotFound: "ChatSessionProjectNotFound",
} as const;
