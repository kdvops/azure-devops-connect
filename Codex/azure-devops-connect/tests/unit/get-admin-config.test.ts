import { describe, expect, it, vi } from "vitest";

import { GetAdminConfigurationUseCase } from "../../src/application/use-cases/get-admin-config";
import type { AzureDevOpsConnectionRepository, ProjectMappingRepository } from "../../src/application/ports/repositories";
import type { AzureDevOpsConnection, ProjectMapping } from "../../src/domain/entities/models";

const createConnectionRepository = (connection: AzureDevOpsConnection | null): AzureDevOpsConnectionRepository => ({
  get: vi.fn().mockResolvedValue(connection),
  save: vi.fn()
});

const createProjectMappingRepository = (
  mappings: ReadonlyArray<ProjectMapping>
): ProjectMappingRepository => ({
  getByJiraProjectId: vi.fn(async (_installationId: string, jiraProjectId: string) =>
    mappings.find((mapping) => mapping.jiraProjectId === jiraProjectId) ?? null
  ),
  getByJiraProjectKey: vi.fn(async (_installationId: string, jiraProjectKey: string) =>
    mappings.find((mapping) => mapping.jiraProjectKey === jiraProjectKey) ?? null
  ),
  listByInstallationId: vi.fn().mockResolvedValue(mappings),
  save: vi.fn()
});

describe("GetAdminConfigurationUseCase", () => {
  it("loads the single existing mapping when no Jira project key is provided", async () => {
    const useCase = new GetAdminConfigurationUseCase(
      createConnectionRepository({
        installationId: "install-1",
        organizationName: "kdvops",
        organizationUrl: "https://dev.azure.com/kdvops",
        personalAccessToken: "pat",
        authenticationType: "PAT",
        status: "CONNECTED",
        lastConnectionTestAt: "2026-06-16T00:00:00.000Z",
        createdAt: "2026-06-16T00:00:00.000Z",
        updatedAt: "2026-06-16T00:00:00.000Z"
      }),
      createProjectMappingRepository([
        {
          installationId: "install-1",
          jiraProjectId: "jira-project-1",
          jiraProjectKey: "ABC",
          azureProjectId: "azure-project-1",
          azureProjectName: "Azure Project",
          repositoryId: "repo-1",
          repositoryName: "repo",
          baseBranch: "main",
          autoCreateBranch: true,
          branchTemplate: "{issueTypePrefix}/{issueKey}-{summarySlug}",
          issueTypePrefixMapping: { Story: "feature" },
          maxBranchLength: 80,
          normalizeLowercase: true,
          enabled: true,
          createdAt: "2026-06-16T00:00:00.000Z",
          updatedAt: "2026-06-16T00:00:00.000Z"
        }
      ])
    );

    const result = await useCase.execute({
      installationId: "install-1",
      jiraProjectKey: ""
    });

    expect(result.mapping?.jiraProjectKey).toBe("ABC");
    expect(result.connection?.organizationName).toBe("kdvops");
  });

  it("does not guess a mapping when multiple project mappings exist", async () => {
    const useCase = new GetAdminConfigurationUseCase(
      createConnectionRepository(null),
      createProjectMappingRepository([
        {
          installationId: "install-1",
          jiraProjectId: "jira-project-1",
          jiraProjectKey: "ABC",
          azureProjectId: "azure-project-1",
          azureProjectName: "Azure Project",
          repositoryId: "repo-1",
          repositoryName: "repo",
          baseBranch: "main",
          autoCreateBranch: true,
          branchTemplate: "{issueTypePrefix}/{issueKey}-{summarySlug}",
          issueTypePrefixMapping: { Story: "feature" },
          maxBranchLength: 80,
          normalizeLowercase: true,
          enabled: true,
          createdAt: "2026-06-16T00:00:00.000Z",
          updatedAt: "2026-06-16T00:00:00.000Z"
        },
        {
          installationId: "install-1",
          jiraProjectId: "jira-project-2",
          jiraProjectKey: "DEF",
          azureProjectId: "azure-project-2",
          azureProjectName: "Azure Project 2",
          repositoryId: "repo-2",
          repositoryName: "repo-2",
          baseBranch: "main",
          autoCreateBranch: true,
          branchTemplate: "{issueTypePrefix}/{issueKey}-{summarySlug}",
          issueTypePrefixMapping: { Task: "feature" },
          maxBranchLength: 80,
          normalizeLowercase: true,
          enabled: true,
          createdAt: "2026-06-16T00:00:00.000Z",
          updatedAt: "2026-06-16T00:00:00.000Z"
        }
      ])
    );

    const result = await useCase.execute({
      installationId: "install-1",
      jiraProjectKey: ""
    });

    expect(result.mapping).toBeNull();
  });
});
