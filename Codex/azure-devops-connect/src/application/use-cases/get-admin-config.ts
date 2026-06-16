import type { AzureDevOpsConnectionRepository, ProjectMappingRepository } from "../ports/repositories";
import type { AdminConfigurationDto } from "./contracts";

export interface GetAdminConfigurationInput {
  readonly installationId: string;
  readonly jiraProjectKey: string;
}

export class GetAdminConfigurationUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly projectMappingRepository: ProjectMappingRepository
  ) {}

  public async execute(input: GetAdminConfigurationInput): Promise<AdminConfigurationDto> {
    const connection = await this.connectionRepository.get(input.installationId);
    const mapping = input.jiraProjectKey.trim()
      ? await this.projectMappingRepository.getByJiraProjectKey(input.installationId, input.jiraProjectKey.trim())
      : null;

    return {
      connection: connection
        ? {
            organizationName: connection.organizationName,
            status: connection.status,
            lastConnectionTestAt: connection.lastConnectionTestAt
          }
        : null,
      mapping: mapping
        ? {
            jiraProjectKey: mapping.jiraProjectKey,
            azureProjectName: mapping.azureProjectName,
            repositoryName: mapping.repositoryName,
            baseBranch: mapping.baseBranch,
            autoCreateBranch: mapping.autoCreateBranch,
            branchTemplate: mapping.branchTemplate,
            issueTypePrefixMapping: mapping.issueTypePrefixMapping,
            maxBranchLength: mapping.maxBranchLength,
            normalizeLowercase: mapping.normalizeLowercase,
            enabled: mapping.enabled
          }
        : null
    };
  }
}
