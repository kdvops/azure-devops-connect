import type { AzureDevOpsConnectionRepository } from "../ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import type { AzureDevOpsConnection } from "../../domain/entities/models";
import { normalizeAzureDevOpsOrganizationName } from "../../infrastructure/azure/azure-devops-organization";

export interface SaveConnectionInput {
  readonly installationId: string;
  readonly organizationName: string;
  readonly personalAccessToken: string;
}

export class SaveConnectionUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: SaveConnectionInput): Promise<void> {
    const organizationName = normalizeAzureDevOpsOrganizationName(input.organizationName);
    const personalAccessToken = input.personalAccessToken.trim();
    const now = new Date().toISOString();

    const gitClient = this.gitClientFactory.create(organizationName, personalAccessToken);
    await gitClient.testConnection();

    const connection: AzureDevOpsConnection = {
      installationId: input.installationId,
      organizationName,
      organizationUrl: `https://dev.azure.com/${organizationName}`,
      personalAccessToken,
      authenticationType: "PAT",
      status: "CONNECTED",
      lastConnectionTestAt: now,
      createdAt: now,
      updatedAt: now
    };

    await this.connectionRepository.save(connection);
  }
}
