import { storage } from "@forge/api";

import type { IssueBranchLink } from "../../domain/entities/models";
import type { IssueBranchRepository } from "../../application/ports/repositories";
import { issueBranchIdempotencyKey, issueBranchKey } from "./forge-storage-keys";

export class ForgeIssueBranchRepository implements IssueBranchRepository {
  public async getByIssueId(
    installationId: string,
    jiraIssueId: string,
    repositoryId: string
  ): Promise<IssueBranchLink | null> {
    return (await storage.get(issueBranchKey(installationId, jiraIssueId, repositoryId))) as IssueBranchLink | null;
  }

  public async save(link: IssueBranchLink): Promise<void> {
    await storage.set(issueBranchKey(link.installationId, link.jiraIssueId, link.repositoryId), link);
    await storage.set(issueBranchIdempotencyKey(link.installationId, link.idempotencyKey), link);
  }

  public async update(link: IssueBranchLink): Promise<void> {
    await this.save(link);
  }

  public async findByIdempotencyKey(installationId: string, idempotencyKey: string): Promise<IssueBranchLink | null> {
    return (await storage.get(issueBranchIdempotencyKey(installationId, idempotencyKey))) as IssueBranchLink | null;
  }
}
