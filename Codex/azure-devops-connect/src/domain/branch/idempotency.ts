export const buildIdempotencyKey = (
  installationId: string,
  jiraIssueId: string,
  repositoryId: string,
  branchName: string
): string => {
  return `${installationId}:${jiraIssueId}:${repositoryId}:${branchName}`;
};
