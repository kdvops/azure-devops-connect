import type { AzureDevOpsConnectionRepository } from "../ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import { DomainError } from "../../domain/errors/domain-error";

export interface TestConnectionInput {
  readonly installationId: string;
}

export class TestConnectionUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: TestConnectionInput): Promise<void> {
    const connection = await this.connectionRepository.get(input.installationId);
    if (!connection) {
      throw new DomainError("CONFIGURATION_NOT_FOUND", "Azure DevOps connection is not configured.");
    }

    const gitClient = this.gitClientFactory.create(connection.organizationName, connection.personalAccessToken);
    await gitClient.testConnection();
  }
}
