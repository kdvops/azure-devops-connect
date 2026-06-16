import type { AzureDevOpsConnectionRepository, IssueBranchRepository, ProjectMappingRepository } from "../ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import type { JiraIssueSnapshot } from "../../domain/entities/models";
import type { BranchStatusDto } from "./contracts";

export interface RefreshIssueBranchInput {
  readonly installationId: string;
  readonly issue: JiraIssueSnapshot;
}

export class RefreshIssueBranchUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly projectMappingRepository: ProjectMappingRepository,
    private readonly issueBranchRepository: IssueBranchRepository,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: RefreshIssueBranchInput): Promise<BranchStatusDto> {
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

    const link = await this.issueBranchRepository.getByIssueId(input.installationId, input.issue.id, mapping.repositoryId);
    if (!link) {
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
        status: link.creationStatus,
        branchName: link.branchName,
        repositoryName: mapping.repositoryName,
        baseBranch: link.baseBranch,
        branchUrl: link.branchUrl,
        lastCommit: link.lastKnownCommit,
        lastSyncAt: link.lastSyncAt,
        error: {
          code: "CONFIGURATION_NOT_FOUND",
          message: "Azure connection is missing."
        }
      };
    }

    const gitClient = this.gitClientFactory.create(connection.organizationName, connection.personalAccessToken);
    const latestCommit = await gitClient.getLatestCommit(mapping.azureProjectName, mapping.repositoryId, link.branchName);
    const now = new Date().toISOString();
    const refreshedLink = {
      ...link,
      lastKnownCommit: latestCommit,
      lastSyncAt: now,
      updatedAt: now
    };

    await this.issueBranchRepository.update(refreshedLink);

    return {
      status: refreshedLink.creationStatus,
      branchName: refreshedLink.branchName,
      repositoryName: mapping.repositoryName,
      baseBranch: refreshedLink.baseBranch,
      branchUrl: refreshedLink.branchUrl,
      lastCommit: refreshedLink.lastKnownCommit,
      lastSyncAt: refreshedLink.lastSyncAt,
      error: null
    };
  }
}
