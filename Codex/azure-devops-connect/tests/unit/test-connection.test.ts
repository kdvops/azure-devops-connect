import { describe, expect, it, vi } from "vitest";

import { TestConnectionUseCase } from "../../src/application/use-cases/test-connection";
import type { AzureDevOpsConnectionRepository } from "../../src/application/ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../../src/application/ports/azure-devops-git-client";
import type { AzureDevOpsConnection } from "../../src/domain/entities/models";

describe("TestConnectionUseCase", () => {
  it("uses the stored organization value when testing the connection", async () => {
    const connection: AzureDevOpsConnection = {
      installationId: "install-1",
      organizationName: "https://dev.azure.com/the-punisher01",
      organizationUrl: "https://dev.azure.com/the-punisher01",
      personalAccessToken: "pat-token",
      authenticationType: "PAT",
      status: "CONNECTED",
      lastConnectionTestAt: "2026-06-16T00:00:00.000Z",
      createdAt: "2026-06-16T00:00:00.000Z",
      updatedAt: "2026-06-16T00:00:00.000Z"
    };

    const testConnection = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn().mockReturnValue({
      testConnection
    });

    const useCase = new TestConnectionUseCase(
      {
        get: vi.fn().mockResolvedValue(connection),
        save: vi.fn()
      } satisfies AzureDevOpsConnectionRepository,
      {
        create
      } satisfies AzureDevOpsGitClientFactory
    );

    await useCase.execute({
      installationId: "install-1"
    });

    expect(create).toHaveBeenCalledWith("https://dev.azure.com/the-punisher01", "pat-token");
    expect(testConnection).toHaveBeenCalledOnce();
  });
});
