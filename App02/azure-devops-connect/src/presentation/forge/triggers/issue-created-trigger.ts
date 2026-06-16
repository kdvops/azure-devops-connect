import { createAppServices } from "../composition-root";
import { resolveInstallationId } from "../context/installation-id";

export interface IssueCreatedEvent {
  readonly issue?: {
    readonly key?: string;
  };
  readonly context?: {
    readonly cloudId?: string;
    readonly installContext?: string;
    readonly localId?: string;
    readonly siteUrl?: string;
  };
}

const services = createAppServices();

export const handleIssueCreatedTrigger = async (event: IssueCreatedEvent): Promise<void> => {
  const issueKey = event.issue?.key;
  if (!issueKey) {
    return;
  }

  const issue = await services.jiraClient.getIssueByKey(issueKey);
  const adminConfiguration = await services.getAdminConfiguration.execute({
    installationId: resolveInstallationId(event.context ?? {}),
    jiraProjectKey: issue.projectKey
  });

  if (!adminConfiguration.mapping?.enabled || !adminConfiguration.mapping.autoCreateBranch) {
    return;
  }

  await services.createIssueBranch.execute({
    installationId: resolveInstallationId(event.context ?? {}),
    issue,
    operationType: "TRIGGER_CREATE_BRANCH"
  });
};
