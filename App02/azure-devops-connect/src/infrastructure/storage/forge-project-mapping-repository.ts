import { storage } from "@forge/api";

import type { ProjectMapping } from "../../domain/entities/models";
import type { ProjectMappingRepository } from "../../application/ports/repositories";
import { projectMappingIndexKey, projectMappingKey } from "./forge-storage-keys";

export class ForgeProjectMappingRepository implements ProjectMappingRepository {
  public async getByJiraProjectId(installationId: string, jiraProjectId: string): Promise<ProjectMapping | null> {
    return (await storage.get(projectMappingKey(installationId, jiraProjectId))) as ProjectMapping | null;
  }

  public async getByJiraProjectKey(installationId: string, jiraProjectKey: string): Promise<ProjectMapping | null> {
    const indexedProjectId = (await storage.get(projectMappingIndexKey(installationId, jiraProjectKey))) as string | null;
    if (!indexedProjectId) {
      return null;
    }

    return this.getByJiraProjectId(installationId, indexedProjectId);
  }

  public async save(mapping: ProjectMapping): Promise<void> {
    await storage.set(projectMappingKey(mapping.installationId, mapping.jiraProjectId), mapping);
    await storage.set(projectMappingIndexKey(mapping.installationId, mapping.jiraProjectKey), mapping.jiraProjectId);
  }
}
