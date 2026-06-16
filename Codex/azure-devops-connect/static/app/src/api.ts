import { invoke } from "@forge/bridge";

import type { AdminConfigurationDto, BranchStatusDto } from "../../../src/application/use-cases/contracts";

export const apiClient = {
  getIssueBranchStatus: (): Promise<BranchStatusDto> => invoke("getIssueBranchStatus"),
  createBranch: (): Promise<BranchStatusDto> => invoke("createBranch"),
  retryBranch: (): Promise<BranchStatusDto> => invoke("retryBranch"),
  refreshBranch: (): Promise<BranchStatusDto> => invoke("refreshBranch"),
  getAdminConfig: (jiraProjectKey: string): Promise<AdminConfigurationDto> =>
    invoke("getAdminConfig", { jiraProjectKey }),
  saveConnection: (payload: {
    organizationName: string;
    personalAccessToken: string;
  }): Promise<{ ok: true }> => invoke("saveConnection", payload),
  testConnection: (): Promise<{ ok: true }> => invoke("testConnection"),
  saveProjectMapping: (payload: {
    jiraProjectKey: string;
    azureProjectName: string;
    repositoryName: string;
    baseBranch: string;
    autoCreateBranch: boolean;
    branchTemplate: string;
    issueTypePrefixMapping: Record<string, string>;
    maxBranchLength: number;
    normalizeLowercase: boolean;
    enabled: boolean;
  }): Promise<{ ok: true }> => invoke("saveProjectMapping", payload)
};
