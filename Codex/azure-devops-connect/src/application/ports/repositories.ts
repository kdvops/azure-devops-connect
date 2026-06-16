import type {
  AzureDevOpsConnection,
  IssueBranchLink,
  OperationLog,
  ProjectMapping
} from "../../domain/entities/models";

export interface AzureDevOpsConnectionRepository {
  get(installationId: string): Promise<AzureDevOpsConnection | null>;
  save(connection: AzureDevOpsConnection): Promise<void>;
}

export interface ProjectMappingRepository {
  getByJiraProjectId(installationId: string, jiraProjectId: string): Promise<ProjectMapping | null>;
  getByJiraProjectKey(installationId: string, jiraProjectKey: string): Promise<ProjectMapping | null>;
  save(mapping: ProjectMapping): Promise<void>;
}

export interface IssueBranchRepository {
  getByIssueId(installationId: string, jiraIssueId: string, repositoryId: string): Promise<IssueBranchLink | null>;
  save(link: IssueBranchLink): Promise<void>;
  update(link: IssueBranchLink): Promise<void>;
  findByIdempotencyKey(installationId: string, idempotencyKey: string): Promise<IssueBranchLink | null>;
}

export interface OperationLogRepository {
  save(log: OperationLog): Promise<void>;
}
