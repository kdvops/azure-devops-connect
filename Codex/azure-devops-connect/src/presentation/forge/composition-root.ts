import { CreateIssueBranchUseCase } from "../../application/use-cases/create-issue-branch";
import { GetAdminConfigurationUseCase } from "../../application/use-cases/get-admin-config";
import { GetIssueBranchStatusUseCase } from "../../application/use-cases/get-issue-branch-status";
import { RefreshIssueBranchUseCase } from "../../application/use-cases/refresh-issue-branch";
import { SaveConnectionUseCase } from "../../application/use-cases/save-connection";
import { SaveProjectMappingUseCase } from "../../application/use-cases/save-project-mapping";
import { TestConnectionUseCase } from "../../application/use-cases/test-connection";
import { DefaultAzureDevOpsGitClientFactory } from "../../infrastructure/azure/azure-devops-git-client";
import { ForgeJiraClient } from "../../infrastructure/jira/forge-jira-client";
import { ForgeConnectionRepository } from "../../infrastructure/storage/forge-connection-repository";
import { ForgeIssueBranchRepository } from "../../infrastructure/storage/forge-issue-branch-repository";
import { ForgeOperationLogRepository } from "../../infrastructure/storage/forge-operation-log-repository";
import { ForgeProjectMappingRepository } from "../../infrastructure/storage/forge-project-mapping-repository";

export interface AppServices {
  readonly saveConnection: SaveConnectionUseCase;
  readonly testConnection: TestConnectionUseCase;
  readonly saveProjectMapping: SaveProjectMappingUseCase;
  readonly getAdminConfiguration: GetAdminConfigurationUseCase;
  readonly createIssueBranch: CreateIssueBranchUseCase;
  readonly getIssueBranchStatus: GetIssueBranchStatusUseCase;
  readonly refreshIssueBranch: RefreshIssueBranchUseCase;
  readonly jiraClient: ForgeJiraClient;
}

export const createAppServices = (): AppServices => {
  const connectionRepository = new ForgeConnectionRepository();
  const projectMappingRepository = new ForgeProjectMappingRepository();
  const issueBranchRepository = new ForgeIssueBranchRepository();
  const operationLogRepository = new ForgeOperationLogRepository();
  const gitClientFactory = new DefaultAzureDevOpsGitClientFactory();
  const jiraClient = new ForgeJiraClient();

  return {
    saveConnection: new SaveConnectionUseCase(connectionRepository, gitClientFactory),
    testConnection: new TestConnectionUseCase(connectionRepository, gitClientFactory),
    saveProjectMapping: new SaveProjectMappingUseCase(
      connectionRepository,
      projectMappingRepository,
      jiraClient,
      gitClientFactory
    ),
    getAdminConfiguration: new GetAdminConfigurationUseCase(connectionRepository, projectMappingRepository),
    createIssueBranch: new CreateIssueBranchUseCase(
      connectionRepository,
      projectMappingRepository,
      issueBranchRepository,
      operationLogRepository,
      gitClientFactory
    ),
    getIssueBranchStatus: new GetIssueBranchStatusUseCase(
      connectionRepository,
      projectMappingRepository,
      issueBranchRepository,
      gitClientFactory
    ),
    refreshIssueBranch: new RefreshIssueBranchUseCase(
      connectionRepository,
      projectMappingRepository,
      issueBranchRepository,
      gitClientFactory
    ),
    jiraClient
  };
};
