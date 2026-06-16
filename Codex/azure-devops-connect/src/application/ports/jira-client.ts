import type { JiraIssueSnapshot, JiraProjectSnapshot } from "../../domain/entities/models";

export interface JiraClient {
  getIssueByKey(issueKey: string): Promise<JiraIssueSnapshot>;
  getProjectByKey(projectKey: string): Promise<JiraProjectSnapshot>;
}
