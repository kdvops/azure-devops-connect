import { describe, expect, it, vi } from "vitest";

import { CreateIssueBranchUseCase } from "../../src/application/use-cases/create-issue-branch";
import type {
  AzureDevOpsConnectionRepository,
  IssueBranchRepository,
  OperationLogRepository,
  ProjectMappingRepository
} from "../../src/application/ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../../src/application/ports/azure-devops-git-client";
import type { AzureDevOpsConnection, JiraIssueSnapshot, ProjectMapping } from "../../src/domain/entities/models";

const connection: AzureDevOpsConnection = {
  installationId: "install-1",
  organizationName: "kdvops",
  organizationUrl: "https://dev.azure.com/kdvops",
  personalAccessToken: "pat",
  authenticationType: "PAT",
  status: "CONNECTED",
  lastConnectionTestAt: "2026-06-16T00:00:00.000Z",
  createdAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z"
};

const mapping: ProjectMapping = {
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
};

const issue: JiraIssueSnapshot = {
  id: "issue-1",
  key: "ABC-123",
  summary: "Login fails",
  issueType: "Story",
  projectId: "jira-project-1",
  projectKey: "ABC"
};

describe("CreateIssueBranchUseCase", () => {
  it("creates the branch using the Jira issue key as the branch name", async () => {
    const createBranch = vi.fn();
    const getBranch = vi.fn().mockResolvedValue({ name: "refs/heads/main", objectId: "base-object-id", url: null });
    const getLatestCommit = vi.fn().mockResolvedValue(null);
    const buildBranchUrl = vi.fn().mockReturnValue("https://dev.azure.com/kdvops/Azure%20Project/_git/repo?version=GBABC-123");

    const gitClientFactory: AzureDevOpsGitClientFactory = {
      create: vi.fn().mockReturnValue({
        branchExists: vi.fn().mockResolvedValue(false),
        getBranch,
        createBranch,
        getLatestCommit,
        buildBranchUrl,
        testConnection: vi.fn(),
        getProject: vi.fn(),
        getRepository: vi.fn()
      })
    };

    const useCase = new CreateIssueBranchUseCase(
      {
        get: vi.fn().mockResolvedValue(connection),
        save: vi.fn()
      } satisfies AzureDevOpsConnectionRepository,
      {
        getByJiraProjectId: vi.fn().mockResolvedValue(mapping),
        getByJiraProjectKey: vi.fn(),
        listByInstallationId: vi.fn(),
        save: vi.fn()
      } satisfies ProjectMappingRepository,
      {
        getByIssueId: vi.fn().mockResolvedValue(null),
        save: vi.fn() as IssueBranchRepository["save"],
        update: vi.fn() as IssueBranchRepository["update"],
        findByIdempotencyKey: vi.fn().mockResolvedValue(null)
      } satisfies IssueBranchRepository,
      {
        save: vi.fn()
      } satisfies OperationLogRepository,
      gitClientFactory
    );

    const result = await useCase.execute({
      installationId: "install-1",
      issue,
      operationType: "CREATE_BRANCH"
    });

    expect(createBranch).toHaveBeenCalledWith("Azure Project", "repo-1", "ABC-123", "base-object-id");
    expect(result.branchName).toBe("ABC-123");
  });
});
