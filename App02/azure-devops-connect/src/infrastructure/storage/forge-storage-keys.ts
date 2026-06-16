export const connectionKey = (installationId: string): string => `connection:${installationId}`;
export const projectMappingKey = (installationId: string, jiraProjectId: string): string =>
  `project-mapping:${installationId}:${jiraProjectId}`;
export const projectMappingIndexKey = (installationId: string, jiraProjectKey: string): string =>
  `project-mapping-index:${installationId}:${jiraProjectKey.toUpperCase()}`;
export const issueBranchKey = (installationId: string, jiraIssueId: string, repositoryId: string): string =>
  `issue-branch:${installationId}:${jiraIssueId}:${repositoryId}`;
export const issueBranchIdempotencyKey = (installationId: string, idempotencyKey: string): string =>
  `issue-branch-idempotency:${installationId}:${idempotencyKey}`;
export const operationLogKey = (installationId: string, correlationId: string, operationType: string): string =>
  `operation-log:${installationId}:${correlationId}:${operationType}`;
