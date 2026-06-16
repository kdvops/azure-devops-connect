import { storage } from "@forge/api";

import type { AzureDevOpsConnection } from "../../domain/entities/models";
import type { AzureDevOpsConnectionRepository } from "../../application/ports/repositories";
import { connectionKey } from "./forge-storage-keys";

export class ForgeConnectionRepository implements AzureDevOpsConnectionRepository {
  public async get(installationId: string): Promise<AzureDevOpsConnection | null> {
    return (await storage.get(connectionKey(installationId))) as AzureDevOpsConnection | null;
  }

  public async save(connection: AzureDevOpsConnection): Promise<void> {
    await storage.set(connectionKey(connection.installationId), connection);
  }
}
