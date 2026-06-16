export const branchStatuses = [
  "NOT_CONFIGURED",
  "PENDING",
  "CREATING",
  "CREATED",
  "ALREADY_EXISTS",
  "FAILED",
  "DISABLED"
] as const;

export type BranchStatus = (typeof branchStatuses)[number];
