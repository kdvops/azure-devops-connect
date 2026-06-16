import { DomainError } from "../errors/domain-error";

export interface BranchNameGeneratorInput {
  readonly issueKey: string;
  readonly issueType: string;
  readonly summary: string;
  readonly template: string;
  readonly issueTypePrefixMapping: Readonly<Record<string, string>>;
  readonly maxLength: number;
  readonly lowercase: boolean;
}

const invalidBranchCharactersPattern = /[\u0000-\u001f\u007f~^:?*\\]+/g;
const separatorPattern = /[\s/_]+/g;
const repeatedDashPattern = /-+/g;
const unsupportedTemplateTokenPattern = /\{[^}]+\}/g;

const slugify = (value: string, lowercase: boolean): string => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(invalidBranchCharactersPattern, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(separatorPattern, "-")
    .replace(/[.]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(repeatedDashPattern, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  return lowercase ? normalized.toLowerCase() : normalized;
};

const sanitizeSegment = (value: string): string => {
  return value
    .replace(invalidBranchCharactersPattern, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\.\./g, ".")
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/\.$/, "");
};

export const generateBranchName = (input: BranchNameGeneratorInput): string => {
  if (input.issueKey.trim().length === 0) {
    throw new DomainError("INVALID_BRANCH_NAME", "Issue key is required to generate a branch name.");
  }

  const issueKey = input.lowercase ? input.issueKey.trim().toLowerCase() : input.issueKey.trim();
  const defaultPrefix = input.issueTypePrefixMapping[input.issueType] ?? "feature";
  const prefix = slugify(defaultPrefix, input.lowercase) || "feature";
  const summarySlug = slugify(input.summary, input.lowercase);

  const candidateTemplate = input.template.includes("{issueKey}") ? input.template : "{issueTypePrefix}/{issueKey}-{summarySlug}";
  const interpolated = candidateTemplate
    .replace(/\{issueTypePrefix\}/g, prefix)
    .replace(/\{issueKey\}/g, issueKey)
    .replace(/\{summarySlug\}/g, summarySlug)
    .replace(unsupportedTemplateTokenPattern, "")
    .replace(/\/+/g, "/")
    .replace(/-+/g, "-")
    .replace(/\/-/g, "/")
    .replace(/-\//g, "/");

  const fallback = sanitizeSegment(`${prefix}/${issueKey}`);
  const baseValue = sanitizeSegment(interpolated).replace(/\/$/, "");
  const valueWithFallback = baseValue.includes(issueKey) ? baseValue : fallback;
  const withoutTrailingDecoration = valueWithFallback
    .replace(/-$/, "")
    .replace(/\.$/, "")
    .replace(/\/$/, "");

  if (!withoutTrailingDecoration || withoutTrailingDecoration.includes("..") || withoutTrailingDecoration.startsWith("/")) {
    throw new DomainError("INVALID_BRANCH_NAME", "Branch name does not satisfy Git naming rules.");
  }

  if (withoutTrailingDecoration.length <= input.maxLength) {
    return withoutTrailingDecoration;
  }

  const staticPrefix = `${prefix}/${issueKey}`;
  if (staticPrefix.length > input.maxLength) {
    throw new DomainError("INVALID_BRANCH_NAME", "Branch max length is smaller than the required issue key.");
  }

  if (!summarySlug) {
    return staticPrefix;
  }

  const separator = candidateTemplate.includes("{summarySlug}") ? "-" : "";
  const availableSummaryLength = input.maxLength - staticPrefix.length - separator.length;
  const truncatedSummary = summarySlug.slice(0, availableSummaryLength).replace(/-+$/, "");

  return truncatedSummary ? `${staticPrefix}${separator}${truncatedSummary}` : staticPrefix;
};
