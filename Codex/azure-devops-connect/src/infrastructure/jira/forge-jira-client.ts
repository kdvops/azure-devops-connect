import api, { route } from "@forge/api";

import type { JiraClient } from "../../application/ports/jira-client";
import type { JiraIssueSnapshot, JiraProjectSnapshot } from "../../domain/entities/models";
import { DomainError } from "../../domain/errors/domain-error";

interface JiraIssueResponse {
  readonly id: string;
  readonly key: string;
  readonly fields: {
    readonly summary?: string;
    readonly issuetype?: {
      readonly name?: string;
    };
    readonly project?: {
      readonly id?: string;
      readonly key?: string;
    };
  };
}

interface JiraProjectResponse {
  readonly id: string;
  readonly key: string;
  readonly name: string;
}

export class ForgeJiraClient implements JiraClient {
  public async getIssueByKey(issueKey: string): Promise<JiraIssueSnapshot> {
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueKey}?fields=summary,issuetype,project`);

    if (!response.ok) {
      throw new DomainError("UNKNOWN_ERROR", "Failed to resolve the Jira issue from context.");
    }

    const issue = (await response.json()) as JiraIssueResponse;
    return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary ?? "",
      issueType: issue.fields.issuetype?.name ?? "Task",
      projectId: issue.fields.project?.id ?? "",
      projectKey: issue.fields.project?.key ?? ""
    };
  }

  public async getProjectByKey(projectKey: string): Promise<JiraProjectSnapshot> {
    const response = await api.asApp().requestJira(route`/rest/api/3/project/${projectKey}`);
    if (!response.ok) {
      throw new DomainError("CONFIGURATION_NOT_FOUND", "Jira project was not found.");
    }

    const project = (await response.json()) as JiraProjectResponse;
    return {
      id: project.id,
      key: project.key,
      name: project.name
    };
  }
}
