import type { BranchStatus } from "../../domain/branch/branch-status";
import type { CommitSummary } from "../../domain/entities/models";

export interface BranchStatusDto {
  readonly status: BranchStatus;
  readonly branchName: string | null;
  readonly repositoryName: string | null;
  readonly baseBranch: string | null;
  readonly branchUrl: string | null;
  readonly lastCommit: CommitSummary | null;
  readonly lastSyncAt: string | null;
  readonly error: {
    readonly code: string;
    readonly message: string;
  } | null;
}

export interface AdminConfigurationDto {
  readonly connection: {
    readonly organizationName: string;
    readonly status: string;
    readonly lastConnectionTestAt: string | null;
  } | null;
  readonly mapping: {
    readonly jiraProjectKey: string;
    readonly azureProjectName: string;
    readonly repositoryName: string;
    readonly baseBranch: string;
    readonly autoCreateBranch: boolean;
    readonly branchTemplate: string;
    readonly issueTypePrefixMapping: Readonly<Record<string, string>>;
    readonly maxBranchLength: number;
    readonly normalizeLowercase: boolean;
    readonly enabled: boolean;
  } | null;
}
