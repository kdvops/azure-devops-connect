import { describe, expect, it } from "vitest";

import { normalizeAzureDevOpsOrganizationName } from "../../src/infrastructure/azure/azure-devops-organization";

describe("normalizeAzureDevOpsOrganizationName", () => {
  it("returns the organization slug unchanged", () => {
    expect(normalizeAzureDevOpsOrganizationName("the-punisher01")).toBe("the-punisher01");
  });

  it("extracts the slug from a dev.azure.com URL", () => {
    expect(normalizeAzureDevOpsOrganizationName("https://dev.azure.com/the-punisher01")).toBe("the-punisher01");
  });

  it("extracts the slug from a dev.azure.com URL with a trailing path", () => {
    expect(normalizeAzureDevOpsOrganizationName("https://dev.azure.com/the-punisher01/")).toBe("the-punisher01");
  });
});
