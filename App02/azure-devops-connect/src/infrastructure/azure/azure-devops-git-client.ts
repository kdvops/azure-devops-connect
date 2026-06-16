import type {
  AzureBranchReference,
  AzureDevOpsGitClient,
  AzureDevOpsGitClientFactory,
  AzureProject,
  AzureRepository
} from "../../application/ports/azure-devops-git-client";
import type { CommitSummary } from "../../domain/entities/models";
import { DomainError } from "../../domain/errors/domain-error";
import { AzureDevOpsHttpClient } from "./azure-devops-http-client";

interface AzureProjectsResponse {
  readonly value: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
}

interface AzureRepositoriesResponse {
  readonly value: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly project?: {
      readonly id: string;
      readonly name: string;
    };
  }>;
}

interface AzureRefsResponse {
  readonly value: ReadonlyArray<{
    readonly name: string;
    readonly objectId: string;
    readonly url: string;
  }>;
}

interface AzureCommitsResponse {
  readonly value: ReadonlyArray<{
    readonly commitId: string;
    readonly comment?: string;
    readonly author?: {
      readonly name?: string;
      readonly date?: string;
    };
    readonly url?: string;
  }>;
}

export class DefaultAzureDevOpsGitClient implements AzureDevOpsGitClient {
  private readonly httpClient: AzureDevOpsHttpClient;

  private readonly organizationName: string;

  public constructor(organizationName: string, personalAccessToken: string) {
    this.organizationName = organizationName;
    this.httpClient = new AzureDevOpsHttpClient(organizationName, personalAccessToken);
  }

  public async testConnection(): Promise<void> {
    await this.httpClient.getJson<AzureProjectsResponse>("/_apis/projects?api-version=7.1-preview.4");
  }

  public async getProject(projectName: string): Promise<AzureProject> {
    const response = await this.httpClient.getJson<AzureProjectsResponse>("/_apis/projects?api-version=7.1-preview.4");
    const project = response.value.find((item) => item.name.toLowerCase() === projectName.toLowerCase());
    if (!project) {
      throw new DomainError("AZURE_PROJECT_NOT_FOUND", "Azure DevOps project was not found.");
    }

    return project;
  }

  public async getRepository(projectName: string, repositoryName: string): Promise<AzureRepository> {
    const response = await this.httpClient.getJson<AzureRepositoriesResponse>(
      `/${encodeURIComponent(projectName)}/_apis/git/repositories?api-version=7.1`
    );
    const repository = response.value.find((item) => item.name.toLowerCase() === repositoryName.toLowerCase());
    if (!repository || !repository.project) {
      throw new DomainError("REPOSITORY_NOT_FOUND", "Azure DevOps repository was not found.");
    }

    return {
      id: repository.id,
      name: repository.name,
      projectId: repository.project.id,
      projectName: repository.project.name
    };
  }

  public async getBranch(projectName: string, repositoryId: string, branchName: string): Promise<AzureBranchReference | null> {
    const response = await this.httpClient.getJson<AzureRefsResponse>(
      `/${encodeURIComponent(projectName)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/refs?filter=heads/${encodeURIComponent(branchName)}&api-version=7.1`
    );

    const branch = response.value.find((item) => item.name === `refs/heads/${branchName}`);
    return branch ?? null;
  }

  public async branchExists(projectName: string, repositoryId: string, branchName: string): Promise<boolean> {
    const branch = await this.getBranch(projectName, repositoryId, branchName);
    return branch !== null;
  }

  public async getLatestCommit(projectName: string, repositoryId: string, branchName: string): Promise<CommitSummary | null> {
    const response = await this.httpClient.getJson<AzureCommitsResponse>(
      `/${encodeURIComponent(projectName)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/commits?searchCriteria.itemVersion.version=${encodeURIComponent(branchName)}&searchCriteria.$top=1&api-version=7.1`
    );
    const commit = response.value[0];
    if (!commit) {
      return null;
    }

    return {
      id: commit.commitId,
      shortId: commit.commitId.slice(0, 7),
      message: commit.comment ?? "",
      author: commit.author?.name ?? "Unknown",
      date: commit.author?.date ?? new Date().toISOString(),
      url: commit.url ?? null
    };
  }

  public async createBranch(projectName: string, repositoryId: string, branchName: string, baseObjectId: string): Promise<void> {
    await this.httpClient.postJson<unknown>(
      `/${encodeURIComponent(projectName)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/refs?api-version=7.1`,
      [
        {
          name: `refs/heads/${branchName}`,
          oldObjectId: "0000000000000000000000000000000000000000",
          newObjectId: baseObjectId
        }
      ]
    );
  }

  public buildBranchUrl(projectName: string, repositoryName: string, branchName: string): string {
    return `https://dev.azure.com/${encodeURIComponent(this.organizationName)}/${encodeURIComponent(projectName)}/_git/${encodeURIComponent(repositoryName)}?version=GB${encodeURIComponent(branchName)}`;
  }
}

export class DefaultAzureDevOpsGitClientFactory implements AzureDevOpsGitClientFactory {
  public create(organizationName: string, personalAccessToken: string): AzureDevOpsGitClient {
    return new DefaultAzureDevOpsGitClient(organizationName, personalAccessToken);
  }
}
