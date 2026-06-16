import type { BranchStatus } from "../branch/branch-status";
import type { DomainErrorCode } from "../errors/domain-error";

export interface AzureDevOpsConnection {
  readonly installationId: string;
  readonly organizationName: string;
  readonly organizationUrl: string;
  readonly personalAccessToken: string;
  readonly authenticationType: "PAT";
  readonly status: "CONNECTED" | "DISCONNECTED";
  readonly lastConnectionTestAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectMapping {
  readonly installationId: string;
  readonly jiraProjectId: string;
  readonly jiraProjectKey: string;
  readonly azureProjectId: string;
  readonly azureProjectName: string;
  readonly repositoryId: string;
  readonly repositoryName: string;
  readonly baseBranch: string;
  readonly autoCreateBranch: boolean;
  readonly branchTemplate: string;
  readonly issueTypePrefixMapping: Readonly<Record<string, string>>;
  readonly maxBranchLength: number;
  readonly normalizeLowercase: boolean;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CommitSummary {
  readonly id: string;
  readonly shortId: string;
  readonly message: string;
  readonly author: string;
  readonly date: string;
  readonly url: string | null;
}

export interface IssueBranchLink {
  readonly installationId: string;
  readonly jiraIssueId: string;
  readonly jiraIssueKey: string;
  readonly jiraProjectId: string;
  readonly repositoryId: string;
  readonly branchName: string;
  readonly baseBranch: string;
  readonly branchUrl: string;
  readonly creationStatus: BranchStatus;
  readonly idempotencyKey: string;
  readonly lastKnownCommit: CommitSummary | null;
  readonly lastSyncAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OperationLog {
  readonly installationId: string;
  readonly issueId: string;
  readonly issueKey: string;
  readonly operationType: "CREATE_BRANCH" | "REFRESH_BRANCH" | "RETRY_BRANCH";
  readonly correlationId: string;
  readonly status: BranchStatus;
  readonly errorCode: DomainErrorCode | null;
  readonly sanitizedErrorMessage: string | null;
  readonly attempt: number;
  readonly createdAt: string;
  readonly completedAt: string;
}

export interface JiraIssueSnapshot {
  readonly id: string;
  readonly key: string;
  readonly summary: string;
  readonly issueType: string;
  readonly projectId: string;
  readonly projectKey: string;
}

export interface JiraProjectSnapshot {
  readonly id: string;
  readonly key: string;
  readonly name: string;
}
