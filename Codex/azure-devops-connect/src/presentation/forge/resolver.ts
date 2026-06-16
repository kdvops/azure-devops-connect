import Resolver from "@forge/resolver";

import { DomainError, toDomainError } from "../../domain/errors/domain-error";
import { createAppServices } from "./composition-root";
import { resolveInstallationId } from "./context/installation-id";
import { resolveIssueKeyFromContext } from "./context/issue-context";

interface ResolverRequest<Payload> {
  readonly payload?: Payload;
  readonly context: {
    readonly cloudId?: string;
    readonly siteUrl?: string;
    readonly localId?: string;
    readonly installContext?: string;
    readonly extension?: {
      readonly issue?: {
        readonly key?: string;
      };
    };
  };
}

interface SaveConnectionPayload {
  readonly organizationName: string;
  readonly personalAccessToken: string;
}

interface SaveProjectMappingPayload {
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

interface GetAdminConfigPayload {
  readonly jiraProjectKey: string;
}

const services = createAppServices();
const resolver = new Resolver();

const logResolverEvent = (eventName: string, details: Record<string, unknown>): void => {
  console.log(
    JSON.stringify({
      eventName,
      ...details
    })
  );
};

const withErrorMapping = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: unknown) {
    const domainError = toDomainError(error);
    console.error(
      JSON.stringify({
        eventName: "resolver.error",
        errorCode: domainError.code,
        safeMessage: domainError.safeMessage
      })
    );
    throw {
      code: domainError.code,
      message: domainError.safeMessage
    };
  }
};

resolver.define("getIssueBranchStatus", async (request: ResolverRequest<Record<string, never>>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    const issueKey = resolveIssueKeyFromContext(context);
    logResolverEvent("getIssueBranchStatus.invoked", {
      installationId: resolveInstallationId(context),
      hasIssueKey: Boolean(issueKey),
      contextKeys: Object.keys(context)
    });
    if (!issueKey) {
      return {
        status: "FAILED",
        branchName: null,
        repositoryName: null,
        baseBranch: null,
        branchUrl: null,
        lastCommit: null,
        lastSyncAt: null,
        error: {
          code: "UNKNOWN_ERROR",
          message: "The current Jira issue context is unavailable."
        }
      };
    }

    const issue = await services.jiraClient.getIssueByKey(issueKey);
    return services.getIssueBranchStatus.execute({
      installationId: resolveInstallationId(context),
      issue
    });
  });
});

resolver.define("createBranch", async (request: ResolverRequest<Record<string, never>>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    const issueKey = resolveIssueKeyFromContext(context);
    logResolverEvent("createBranch.invoked", {
      installationId: resolveInstallationId(context),
      hasIssueKey: Boolean(issueKey)
    });
    if (!issueKey) {
      throw new DomainError("UNKNOWN_ERROR", "The current Jira issue context is unavailable.");
    }

    const issue = await services.jiraClient.getIssueByKey(issueKey);
    return services.createIssueBranch.execute({
      installationId: resolveInstallationId(context),
      issue,
      operationType: "CREATE_BRANCH"
    });
  });
});

resolver.define("retryBranch", async (request: ResolverRequest<Record<string, never>>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    const issueKey = resolveIssueKeyFromContext(context);
    logResolverEvent("retryBranch.invoked", {
      installationId: resolveInstallationId(context),
      hasIssueKey: Boolean(issueKey)
    });
    if (!issueKey) {
      throw new DomainError("UNKNOWN_ERROR", "The current Jira issue context is unavailable.");
    }

    const issue = await services.jiraClient.getIssueByKey(issueKey);
    return services.createIssueBranch.execute({
      installationId: resolveInstallationId(context),
      issue,
      operationType: "RETRY_BRANCH"
    });
  });
});

resolver.define("refreshBranch", async (request: ResolverRequest<Record<string, never>>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    const issueKey = resolveIssueKeyFromContext(context);
    logResolverEvent("refreshBranch.invoked", {
      installationId: resolveInstallationId(context),
      hasIssueKey: Boolean(issueKey)
    });
    if (!issueKey) {
      throw new DomainError("UNKNOWN_ERROR", "The current Jira issue context is unavailable.");
    }

    const issue = await services.jiraClient.getIssueByKey(issueKey);
    return services.refreshIssueBranch.execute({
      installationId: resolveInstallationId(context),
      issue
    });
  });
});

resolver.define("getAdminConfig", async (request: ResolverRequest<GetAdminConfigPayload>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    return services.getAdminConfiguration.execute({
      installationId: resolveInstallationId(context),
      jiraProjectKey: request.payload?.jiraProjectKey ?? ""
    });
  });
});

resolver.define("saveConnection", async (request: ResolverRequest<SaveConnectionPayload>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    await services.saveConnection.execute({
      installationId: resolveInstallationId(context),
      organizationName: request.payload?.organizationName ?? "",
      personalAccessToken: request.payload?.personalAccessToken ?? ""
    });

    return { ok: true };
  });
});

resolver.define("testConnection", async (request: ResolverRequest<Record<string, never>>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    await services.testConnection.execute({
      installationId: resolveInstallationId(context)
    });

    return { ok: true };
  });
});

resolver.define("saveProjectMapping", async (request: ResolverRequest<SaveProjectMappingPayload>) => {
  return withErrorMapping(async () => {
    const context = request.context ?? {};
    const mapping = await services.saveProjectMapping.execute({
      installationId: resolveInstallationId(context),
      jiraProjectKey: request.payload?.jiraProjectKey ?? "",
      azureProjectName: request.payload?.azureProjectName ?? "",
      repositoryName: request.payload?.repositoryName ?? "",
      baseBranch: request.payload?.baseBranch ?? "",
      autoCreateBranch: request.payload?.autoCreateBranch ?? true,
      branchTemplate: request.payload?.branchTemplate ?? "",
      issueTypePrefixMapping: request.payload?.issueTypePrefixMapping ?? {},
      maxBranchLength: request.payload?.maxBranchLength ?? 80,
      normalizeLowercase: request.payload?.normalizeLowercase ?? true,
      enabled: request.payload?.enabled ?? true
    });

    return {
      ok: true,
      mapping
    };
  });
});

export const handler = resolver.getDefinitions();
