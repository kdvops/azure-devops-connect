export const defaultBranchTemplate = "{issueTypePrefix}/{issueKey}-{summarySlug}";
export const defaultBranchLength = 80;
export const defaultIssueTypePrefixMapping: Readonly<Record<string, string>> = {
  Story: "feature",
  Task: "feature",
  Bug: "bugfix"
};
