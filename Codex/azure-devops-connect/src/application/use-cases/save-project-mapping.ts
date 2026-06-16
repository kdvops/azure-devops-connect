import type { JiraClient } from "../ports/jira-client";
import type { AzureDevOpsConnectionRepository, ProjectMappingRepository } from "../ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import type { ProjectMapping } from "../../domain/entities/models";
import { DomainError } from "../../domain/errors/domain-error";
import {
  defaultBranchLength,
  defaultBranchTemplate,
  defaultIssueTypePrefixMapping
} from "./defaults";

export interface SaveProjectMappingInput {
  readonly installationId: string;
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
}

export class SaveProjectMappingUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly projectMappingRepository: ProjectMappingRepository,
    private readonly jiraClient: JiraClient,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: SaveProjectMappingInput): Promise<ProjectMapping> {
    const connection = await this.connectionRepository.get(input.installationId);
    if (!connection) {
      throw new DomainError("CONFIGURATION_NOT_FOUND", "Configure the Azure DevOps connection first.");
    }

    const jiraProject = await this.jiraClient.getProjectByKey(input.jiraProjectKey.trim());
    const gitClient = this.gitClientFactory.create(connection.organizationName, connection.personalAccessToken);
    const azureProject = await gitClient.getProject(input.azureProjectName.trim());
    const repository = await gitClient.getRepository(azureProject.name, input.repositoryName.trim());

    const existing = await this.projectMappingRepository.getByJiraProjectId(input.installationId, jiraProject.id);
    const now = new Date().toISOString();

    const mapping: ProjectMapping = {
      installationId: input.installationId,
      jiraProjectId: jiraProject.id,
      jiraProjectKey: jiraProject.key,
      azureProjectId: azureProject.id,
      azureProjectName: azureProject.name,
      repositoryId: repository.id,
      repositoryName: repository.name,
      baseBranch: input.baseBranch.trim(),
      autoCreateBranch: input.autoCreateBranch,
      branchTemplate: input.branchTemplate.trim() || defaultBranchTemplate,
      issueTypePrefixMapping:
        Object.keys(input.issueTypePrefixMapping).length > 0 ? input.issueTypePrefixMapping : defaultIssueTypePrefixMapping,
      maxBranchLength: input.maxBranchLength > 0 ? input.maxBranchLength : defaultBranchLength,
      normalizeLowercase: input.normalizeLowercase,
      enabled: input.enabled,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    await this.projectMappingRepository.save(mapping);
    return mapping;
  }
}
