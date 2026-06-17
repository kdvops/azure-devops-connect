import { describe, expect, it, vi } from "vitest";

import { SaveConnectionUseCase } from "../../src/application/use-cases/save-connection";
import type { AzureDevOpsConnectionRepository } from "../../src/application/ports/repositories";
import type { AzureDevOpsGitClientFactory } from "../../src/application/ports/azure-devops-git-client";

describe("SaveConnectionUseCase", () => {
  it("normalizes a full Azure DevOps URL before saving", async () => {
    const testConnection = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn().mockReturnValue({
      testConnection
    });
    const save = vi.fn().mockResolvedValue(undefined);

    const useCase = new SaveConnectionUseCase(
      {
        get: vi.fn(),
        save
      } satisfies AzureDevOpsConnectionRepository,
      {
        create
      } satisfies AzureDevOpsGitClientFactory
    );

    await useCase.execute({
      installationId: "install-1",
      organizationName: "https://dev.azure.com/the-punisher01",
      personalAccessToken: "  pat-token  "
    });

    expect(create).toHaveBeenCalledWith("the-punisher01", "pat-token");
    expect(testConnection).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationName: "the-punisher01",
        organizationUrl: "https://dev.azure.com/the-punisher01",
        personalAccessToken: "pat-token",
        status: "CONNECTED"
      })
    );
  });
});
