import { storage } from "@forge/api";

import type { OperationLog } from "../../domain/entities/models";
import type { OperationLogRepository } from "../../application/ports/repositories";
import { operationLogKey } from "./forge-storage-keys";

export class ForgeOperationLogRepository implements OperationLogRepository {
  public async save(log: OperationLog): Promise<void> {
    await storage.set(operationLogKey(log.installationId, log.correlationId, log.operationType), log);
  }
}
