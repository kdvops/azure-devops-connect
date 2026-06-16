import { buildIdempotencyKey } from "../../domain/branch/idempotency";
import { generateBranchName } from "../../domain/branch/branch-name-generator";
import type { JiraIssueSnapshot, IssueBranchLink, OperationLog } from "../../domain/entities/models";
import { DomainError, toDomainError } from "../../domain/errors/domain-error";
import type { AzureDevOpsGitClientFactory } from "../ports/azure-devops-git-client";
import type {
  AzureDevOpsConnectionRepository,
  IssueBranchRepository,
  OperationLogRepository,
  ProjectMappingRepository
} from "../ports/repositories";
import type { BranchStatusDto } from "./contracts";

export interface CreateIssueBranchInput {
  readonly installationId: string;
  readonly issue: JiraIssueSnapshot;
  readonly operationType: "CREATE_BRANCH" | "RETRY_BRANCH" | "TRIGGER_CREATE_BRANCH";
}

export class CreateIssueBranchUseCase {
  public constructor(
    private readonly connectionRepository: AzureDevOpsConnectionRepository,
    private readonly projectMappingRepository: ProjectMappingRepository,
    private readonly issueBranchRepository: IssueBranchRepository,
    private readonly operationLogRepository: OperationLogRepository,
    private readonly gitClientFactory: AzureDevOpsGitClientFactory
  ) {}

  public async execute(input: CreateIssueBranchInput): Promise<BranchStatusDto> {
    const correlationId = crypto.randomUUID();
    const now = new Date().toISOString();
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

    if (!mapping.enabled) {
      return {
        status: "DISABLED",
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
      throw new DomainError("CONFIGURATION_NOT_FOUND", "Azure DevOps connection is not configured.");
    }

    const gitClient = this.gitClientFactory.create(connection.organizationName, connection.personalAccessToken);
    const branchName = generateBranchName({
      issueKey: input.issue.key,
      issueType: input.issue.issueType,
      summary: input.issue.summary,
      template: mapping.branchTemplate,
      issueTypePrefixMapping: mapping.issueTypePrefixMapping,
      maxLength: mapping.maxBranchLength,
      lowercase: mapping.normalizeLowercase
    });
    const idempotencyKey = buildIdempotencyKey(input.installationId, input.issue.id, mapping.repositoryId, branchName);

    const existingByIdempotency = await this.issueBranchRepository.findByIdempotencyKey(input.installationId, idempotencyKey);
    if (existingByIdempotency) {
      return this.mapLinkToStatusDto(existingByIdempotency, mapping.repositoryName);
    }

    const existingLink = await this.issueBranchRepository.getByIssueId(input.installationId, input.issue.id, mapping.repositoryId);
    if (existingLink) {
      return this.mapLinkToStatusDto(existingLink, mapping.repositoryName);
    }

    try {
      const branchAlreadyExists = await gitClient.branchExists(mapping.azureProjectName, mapping.repositoryId, branchName);
      if (branchAlreadyExists) {
        const link = await this.persistLink({
          installationId: input.installationId,
          issue: input.issue,
          repositoryId: mapping.repositoryId,
          repositoryName: mapping.repositoryName,
          azureProjectName: mapping.azureProjectName,
          baseBranch: mapping.baseBranch,
          branchName,
          idempotencyKey,
          status: "ALREADY_EXISTS",
          gitClient
        });
        await this.saveOperationLog({
          installationId: input.installationId,
          issueId: input.issue.id,
          issueKey: input.issue.key,
          correlationId,
          status: "ALREADY_EXISTS",
          operationType: this.normalizeOperationType(input.operationType),
          errorCode: null,
          safeMessage: null,
          now
        });
        return this.mapLinkToStatusDto(link, mapping.repositoryName);
      }

      const baseBranch = await gitClient.getBranch(mapping.azureProjectName, mapping.repositoryId, mapping.baseBranch);
      if (!baseBranch) {
        throw new DomainError("BASE_BRANCH_NOT_FOUND", "Configured base branch was not found in Azure DevOps.");
      }

      await gitClient.createBranch(mapping.azureProjectName, mapping.repositoryId, branchName, baseBranch.objectId);
      const link = await this.persistLink({
        installationId: input.installationId,
        issue: input.issue,
        repositoryId: mapping.repositoryId,
        repositoryName: mapping.repositoryName,
        azureProjectName: mapping.azureProjectName,
        baseBranch: mapping.baseBranch,
        branchName,
        idempotencyKey,
        status: "CREATED",
        gitClient
      });
      await this.saveOperationLog({
        installationId: input.installationId,
        issueId: input.issue.id,
        issueKey: input.issue.key,
        correlationId,
        status: "CREATED",
        operationType: this.normalizeOperationType(input.operationType),
        errorCode: null,
        safeMessage: null,
        now
      });
      return this.mapLinkToStatusDto(link, mapping.repositoryName);
    } catch (error: unknown) {
      const domainError = toDomainError(error);
      await this.saveOperationLog({
        installationId: input.installationId,
        issueId: input.issue.id,
        issueKey: input.issue.key,
        correlationId,
        status: "FAILED",
        operationType: this.normalizeOperationType(input.operationType),
        errorCode: domainError.code,
        safeMessage: domainError.safeMessage,
        now
      });
      throw domainError;
    }
  }

  private normalizeOperationType(input: CreateIssueBranchInput["operationType"]): OperationLog["operationType"] {
    if (input === "RETRY_BRANCH") {
      return "RETRY_BRANCH";
    }

    return "CREATE_BRANCH";
  }

  private async persistLink(input: {
    readonly installationId: string;
    readonly issue: JiraIssueSnapshot;
    readonly repositoryId: string;
    readonly repositoryName: string;
    readonly azureProjectName: string;
    readonly baseBranch: string;
    readonly branchName: string;
    readonly idempotencyKey: string;
    readonly status: "CREATED" | "ALREADY_EXISTS";
    readonly gitClient: {
      getLatestCommit(projectName: string, repositoryId: string, branchName: string): Promise<IssueBranchLink["lastKnownCommit"]>;
      buildBranchUrl(projectName: string, repositoryName: string, branchName: string): string;
    };
  }): Promise<IssueBranchLink> {
    const now = new Date().toISOString();
    const lastKnownCommit = await input.gitClient.getLatestCommit(input.azureProjectName, input.repositoryId, input.branchName);

    const link: IssueBranchLink = {
      installationId: input.installationId,
      jiraIssueId: input.issue.id,
      jiraIssueKey: input.issue.key,
      jiraProjectId: input.issue.projectId,
      repositoryId: input.repositoryId,
      branchName: input.branchName,
      baseBranch: input.baseBranch,
      branchUrl: input.gitClient.buildBranchUrl(input.azureProjectName, input.repositoryName, input.branchName),
      creationStatus: input.status,
      idempotencyKey: input.idempotencyKey,
      lastKnownCommit,
      lastSyncAt: now,
      createdAt: now,
      updatedAt: now
    };

    await this.issueBranchRepository.save(link);
    return link;
  }

  private mapLinkToStatusDto(link: IssueBranchLink, repositoryName: string): BranchStatusDto {
    return {
      status: link.creationStatus,
      branchName: link.branchName,
      repositoryName,
      baseBranch: link.baseBranch,
      branchUrl: link.branchUrl,
      lastCommit: link.lastKnownCommit,
      lastSyncAt: link.lastSyncAt,
      error: null
    };
  }

  private async saveOperationLog(input: {
    readonly installationId: string;
    readonly issueId: string;
    readonly issueKey: string;
    readonly correlationId: string;
    readonly status: OperationLog["status"];
    readonly operationType: OperationLog["operationType"];
    readonly errorCode: OperationLog["errorCode"];
    readonly safeMessage: string | null;
    readonly now: string;
  }): Promise<void> {
    const log: OperationLog = {
      installationId: input.installationId,
      issueId: input.issueId,
      issueKey: input.issueKey,
      operationType: input.operationType,
      correlationId: input.correlationId,
      status: input.status,
      errorCode: input.errorCode,
      sanitizedErrorMessage: input.safeMessage,
      attempt: 1,
      createdAt: input.now,
      completedAt: input.now
    };

    await this.operationLogRepository.save(log);
  }
}
