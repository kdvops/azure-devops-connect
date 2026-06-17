import { describe, expect, it, vi } from "vitest";

const { fetchSpy } = vi.hoisted(() => ({
  fetchSpy: vi.fn()
}));

vi.mock("@forge/api", () => ({
  default: {
    fetch: fetchSpy
  }
}));

import { DefaultAzureDevOpsGitClient } from "../../src/infrastructure/azure/azure-devops-git-client";

describe("DefaultAzureDevOpsGitClient", () => {
  it("normalizes the organization URL before calling Azure DevOps", async () => {
    fetchSpy.mockResolvedValue({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValue({ value: [] })
    });

    const client = new DefaultAzureDevOpsGitClient("https://dev.azure.com/the-punisher01", "pat-token");
    await client.testConnection();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://dev.azure.com/the-punisher01/_apis/projects?api-version=7.1-preview.4",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic ")
        })
      })
    );
  });
});
