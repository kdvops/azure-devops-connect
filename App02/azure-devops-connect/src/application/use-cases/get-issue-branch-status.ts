import type { AzureDevOpsConnectionRepository, IssueBranchRepository, ProjectMappingRepository } from "../ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import type { JiraIssueSnapshot } from "../../domain/entities/models";
import type { BranchStatusDto } from "./contracts";

export interface GetIssueBranchStatusInput {
  readonly installationId: string;
  readonly issue: JiraIssueSnapshot;
}

export class GetIssueBranchStatusUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly projectMappingRepository: ProjectMappingRepository,
    private readonly issueBranchRepository: IssueBranchRepository,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: GetIssueBranchStatusInput): Promise<BranchStatusDto> {
    const mapping = await this.projectMappingRepository.getByJiraProjectId(input.installationId, input.issue.projectId);
    if (!mapping) {
      return {
        status: "NOT_CONFIGURED",
        branchName: null,
        repositoryName: null,
        baseBranch: null,
        branchUrl: null,
        lastCommit: null,
        lastSyncAt: null,
        error: null
      };
    }

    if (!mapping.enabled) {
      return {
        status: "DISABLED",
        branchName: null,
        repositoryName: mapping.repositoryName,
        baseBranch: mapping.baseBranch,
        branchUrl: null,
        lastCommit: null,
        lastSyncAt: null,
        error: null
      };
    }

    const existing = await this.issueBranchRepository.getByIssueId(input.installationId, input.issue.id, mapping.repositoryId);
    if (!existing) {
      return {
        status: "PENDING",
        branchName: null,
        repositoryName: mapping.repositoryName,
        baseBranch: mapping.baseBranch,
        branchUrl: null,
        lastCommit: null,
        lastSyncAt: null,
        error: null
      };
    }

    const connection = await this.connectionRepository.get(input.installationId);
    if (!connection) {
      return {
        status: existing.creationStatus,
        branchName: existing.branchName,
        repositoryName: mapping.repositoryName,
        baseBranch: existing.baseBranch,
        branchUrl: existing.branchUrl,
        lastCommit: existing.lastKnownCommit,
        lastSyncAt: existing.lastSyncAt,
        error: {
          code: "CONFIGURATION_NOT_FOUND",
          message: "Azure connection is missing."
        }
      };
    }

    const gitClient = this.gitClientFactory.create(connection.organizationName, connection.personalAccessToken);
    const latestCommit = await gitClient.getLatestCommit(mapping.azureProjectName, mapping.repositoryId, existing.branchName);

    return {
      status: existing.creationStatus,
      branchName: existing.branchName,
      repositoryName: mapping.repositoryName,
      baseBranch: existing.baseBranch,
      branchUrl: existing.branchUrl,
      lastCommit: latestCommit ?? existing.lastKnownCommit,
      lastSyncAt: existing.lastSyncAt,
      error: null
    };
  }
}
