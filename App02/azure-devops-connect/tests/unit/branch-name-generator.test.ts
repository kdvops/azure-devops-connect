import { describe, expect, it } from "vitest";

import { generateBranchName } from "../../src/domain/branch/branch-name-generator";

describe("generateBranchName", () => {
  it("creates a deterministic branch name for a standard issue", () => {
    const branchName = generateBranchName({
      issueKey: "NS-125",
      issueType: "Story",
      summary: "Google login",
      template: "{issueTypePrefix}/{issueKey}-{summarySlug}",
      issueTypePrefixMapping: {
        Story: "feature"
      },
      maxLength: 80,
      lowercase: true
    });

    expect(branchName).toBe("feature/ns-125-google-login");
  });

  it("falls back to prefix and issue key when summary is empty", () => {
    const branchName = generateBranchName({
      issueKey: "NS-125",
      issueType: "Task",
      summary: "",
      template: "{issueTypePrefix}/{issueKey}-{summarySlug}",
      issueTypePrefixMapping: {
        Task: "feature"
      },
      maxLength: 80,
      lowercase: false
    });

    expect(branchName).toBe("feature/NS-125");
  });

  it("normalizes unicode and invalid characters", () => {
    const branchName = generateBranchName({
      issueKey: "NS-200",
      issueType: "Bug",
      summary: "Error crítico / login???",
      template: "{issueTypePrefix}/{issueKey}-{summarySlug}",
      issueTypePrefixMapping: {
        Bug: "bugfix"
      },
      maxLength: 80,
      lowercase: true
    });

    expect(branchName).toBe("bugfix/ns-200-error-critico-login");
  });

  it("respects the max length without dropping the issue key", () => {
    const branchName = generateBranchName({
      issueKey: "NS-999",
      issueType: "Story",
      summary: "A".repeat(120),
      template: "{issueTypePrefix}/{issueKey}-{summarySlug}",
      issueTypePrefixMapping: {
        Story: "feature"
      },
      maxLength: 24,
      lowercase: true
    });

    expect(branchName).toBe("feature/ns-999-aaaaaaaaa");
  });
});
