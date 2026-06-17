import type { AzureDevOpsConnectionRepository, ProjectMappingRepository } from "../ports/repositories";
import type { ProjectMapping } from "../../domain/entities/models";
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
    const normalizedProjectKey = input.jiraProjectKey.trim();
    const mapping = normalizedProjectKey
      ? await this.projectMappingRepository.getByJiraProjectKey(input.installationId, normalizedProjectKey)
      : await this.resolveDefaultMapping(input.installationId);

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

  private async resolveDefaultMapping(installationId: string): Promise<ProjectMapping | null> {
    const mappings = await this.projectMappingRepository.listByInstallationId(installationId);
    if (mappings.length !== 1) {
      return null;
    }

    return mappings[0] ?? null;
  }
}
