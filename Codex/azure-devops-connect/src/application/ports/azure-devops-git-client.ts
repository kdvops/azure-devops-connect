import type { CommitSummary } from "../../domain/entities/models";

export interface AzureProject {
  readonly id: string;
  readonly name: string;
}

export interface AzureRepository {
  readonly id: string;
  readonly name: string;
  readonly projectId: string;
  readonly projectName: string;
}

export interface AzureBranchReference {
  readonly name: string;
  readonly objectId: string;
  readonly url: string;
}

export interface AzureDevOpsGitClient {
  testConnection(): Promise<void>;
  getProject(projectName: string): Promise<AzureProject>;
  getRepository(projectName: string, repositoryName: string): Promise<AzureRepository>;
  getBranch(projectName: string, repositoryId: string, branchName: string): Promise<AzureBranchReference | null>;
  branchExists(projectName: string, repositoryId: string, branchName: string): Promise<boolean>;
  getLatestCommit(projectName: string, repositoryId: string, branchName: string): Promise<CommitSummary | null>;
  createBranch(projectName: string, repositoryId: string, branchName: string, baseObjectId: string): Promise<void>;
  buildBranchUrl(projectName: string, repositoryName: string, branchName: string): string;
}

export interface AzureDevOpsGitClientFactory {
  create(organizationName: string, personalAccessToken: string): AzureDevOpsGitClient;
}
