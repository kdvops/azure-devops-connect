export const domainErrorCodes = [
  "CONFIGURATION_NOT_FOUND",
  "AZURE_CONNECTION_FAILED",
  "AZURE_UNAUTHORIZED",
  "AZURE_FORBIDDEN",
  "AZURE_PROJECT_NOT_FOUND",
  "REPOSITORY_NOT_FOUND",
  "BASE_BRANCH_NOT_FOUND",
  "BRANCH_ALREADY_EXISTS",
  "INVALID_BRANCH_NAME",
  "RATE_LIMITED",
  "AZURE_SERVICE_UNAVAILABLE",
  "NETWORK_ERROR",
  "STORAGE_ERROR",
  "UNKNOWN_ERROR"
] as const;

export type DomainErrorCode = (typeof domainErrorCodes)[number];

export class DomainError extends Error {
  public readonly code: DomainErrorCode;

  public readonly safeMessage: string;

  public constructor(code: DomainErrorCode, safeMessage: string) {
    super(safeMessage);
    this.name = "DomainError";
    this.code = code;
    this.safeMessage = safeMessage;
  }
}

export const toDomainError = (error: unknown): DomainError => {
  if (error instanceof DomainError) {
    return error;
  }

  return new DomainError("UNKNOWN_ERROR", "An unexpected error occurred.");
};
