import { useEffect, useMemo, useState, startTransition } from "react";
import { view } from "@forge/bridge";

import { apiClient } from "./api";

import type { AdminConfigurationDto, BranchStatusDto } from "../../../src/application/use-cases/contracts";

interface ForgeViewContext {
  readonly extension?: {
    readonly issue?: {
      readonly key?: string;
    };
  };
}

interface MappingFormState {
  readonly jiraProjectKey: string;
  readonly azureProjectName: string;
  readonly repositoryName: string;
  readonly baseBranch: string;
  readonly autoCreateBranch: boolean;
  readonly branchTemplate: string;
  readonly prefixMappingText: string;
  readonly maxBranchLength: number;
  readonly normalizeLowercase: boolean;
  readonly enabled: boolean;
}

const defaultMappingState: MappingFormState = {
  jiraProjectKey: "",
  azureProjectName: "",
  repositoryName: "",
  baseBranch: "main",
  autoCreateBranch: true,
  branchTemplate: "{issueTypePrefix}/{issueKey}-{summarySlug}",
  prefixMappingText: "Story=feature\nTask=feature\nBug=bugfix",
  maxBranchLength: 80,
  normalizeLowercase: true,
  enabled: true
};

const parsePrefixMapping = (value: string): Record<string, string> => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.includes("="))
    .reduce<Record<string, string>>((accumulator, line) => {
      const [key, rawValue] = line.split("=");
      const trimmedKey = key?.trim();
      const trimmedValue = rawValue?.trim();
      if (trimmedKey && trimmedValue) {
        accumulator[trimmedKey] = trimmedValue;
      }
      return accumulator;
    }, {});
};

const mappingToText = (mapping: Readonly<Record<string, string>> | undefined): string => {
  if (!mapping) {
    return defaultMappingState.prefixMappingText;
  }

  return Object.entries(mapping)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
};

const IssuePanel = (): JSX.Element => {
  const [status, setStatus] = useState<BranchStatusDto | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      apiClient
        .getIssueBranchStatus()
        .then((result) => {
          setStatus(result);
          setError(null);
        })
        .catch((caughtError: { message?: string }) => {
          setError(caughtError.message ?? "Unable to load branch status.");
        });
    });
  }, []);

  const runAction = async (actionName: "create" | "retry" | "refresh"): Promise<void> => {
    setPendingAction(actionName);
    setMessage(null);
    setError(null);

    try {
      const result =
        actionName === "create"
          ? await apiClient.createBranch()
          : actionName === "retry"
            ? await apiClient.retryBranch()
            : await apiClient.refreshBranch();

      setStatus(result);
      setMessage(actionName === "refresh" ? "Branch status refreshed." : "Branch operation completed.");
    } catch (caughtError: unknown) {
      const typedError = caughtError as { message?: string };
      setError(typedError.message ?? "The action could not be completed.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="shell">
      <div className="stack">
        <section className="card">
          <div className="eyebrow">Issue Panel</div>
          <h1 className="title">Azure DevOps Branch</h1>
          <p className="muted">Create, refresh and inspect the branch linked to this Jira issue.</p>
          <div className="pill" data-status={status?.status ?? "PENDING"}>
            {status?.status ?? "Loading"}
          </div>
        </section>

        {message ? <div className="success">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <section className="card details">
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Branch</strong>
              <span>{status?.branchName ?? "Not created yet"}</span>
            </div>
            <div className="detail-item">
              <strong>Repository</strong>
              <span>{status?.repositoryName ?? "Not configured"}</span>
            </div>
            <div className="detail-item">
              <strong>Base Branch</strong>
              <span>{status?.baseBranch ?? "Not configured"}</span>
            </div>
            <div className="detail-item">
              <strong>Last Sync</strong>
              <span>{status?.lastSyncAt ?? "Never"}</span>
            </div>
          </div>

          {status?.lastCommit ? (
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Commit</strong>
                <span>{status.lastCommit.shortId}</span>
              </div>
              <div className="detail-item">
                <strong>Author</strong>
                <span>{status.lastCommit.author}</span>
              </div>
              <div className="detail-item">
                <strong>Date</strong>
                <span>{status.lastCommit.date}</span>
              </div>
              <div className="detail-item">
                <strong>Message</strong>
                <span>{status.lastCommit.message || "No message"}</span>
              </div>
            </div>
          ) : null}

          {status?.branchUrl ? (
            <a href={status.branchUrl} target="_blank" rel="noreferrer">
              Open in Azure DevOps
            </a>
          ) : null}
        </section>

        <section className="card">
          <div className="actions">
            <button disabled={pendingAction !== null} onClick={() => void runAction("create")}>
              {pendingAction === "create" ? "Creating..." : "Create Branch"}
            </button>
            <button className="secondary" disabled={pendingAction !== null} onClick={() => void runAction("retry")}>
              {pendingAction === "retry" ? "Retrying..." : "Retry"}
            </button>
            <button className="secondary" disabled={pendingAction !== null} onClick={() => void runAction("refresh")}>
              {pendingAction === "refresh" ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const AdminPage = (): JSX.Element => {
  const [organizationName, setOrganizationName] = useState("");
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [mappingForm, setMappingForm] = useState<MappingFormState>(defaultMappingState);
  const [adminConfig, setAdminConfig] = useState<AdminConfigurationDto | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mappingPayload = useMemo(
    () => ({
      jiraProjectKey: mappingForm.jiraProjectKey,
      azureProjectName: mappingForm.azureProjectName,
      repositoryName: mappingForm.repositoryName,
      baseBranch: mappingForm.baseBranch,
      autoCreateBranch: mappingForm.autoCreateBranch,
      branchTemplate: mappingForm.branchTemplate,
      issueTypePrefixMapping: parsePrefixMapping(mappingForm.prefixMappingText),
      maxBranchLength: mappingForm.maxBranchLength,
      normalizeLowercase: mappingForm.normalizeLowercase,
      enabled: mappingForm.enabled
    }),
    [mappingForm]
  );

  const loadConfig = async (): Promise<void> => {
    try {
      const result = await apiClient.getAdminConfig(mappingForm.jiraProjectKey);
      setAdminConfig(result);
      if (result.connection) {
        setOrganizationName(result.connection.organizationName);
      }
      if (result.mapping) {
        setMappingForm({
          jiraProjectKey: result.mapping.jiraProjectKey,
          azureProjectName: result.mapping.azureProjectName,
          repositoryName: result.mapping.repositoryName,
          baseBranch: result.mapping.baseBranch,
          autoCreateBranch: result.mapping.autoCreateBranch,
          branchTemplate: result.mapping.branchTemplate,
          prefixMappingText: mappingToText(result.mapping.issueTypePrefixMapping),
          maxBranchLength: result.mapping.maxBranchLength,
          normalizeLowercase: result.mapping.normalizeLowercase,
          enabled: result.mapping.enabled
        });
      }
      setError(null);
    } catch (caughtError: unknown) {
      const typedError = caughtError as { message?: string };
      setError(typedError.message ?? "Unable to load admin configuration.");
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const saveConnection = async (): Promise<void> => {
    setPendingAction("connection");
    setMessage(null);
    setError(null);
    try {
      await apiClient.saveConnection({ organizationName, personalAccessToken });
      setMessage("Connection saved and validated.");
      setPersonalAccessToken("");
      await loadConfig();
    } catch (caughtError: unknown) {
      const typedError = caughtError as { message?: string };
      setError(typedError.message ?? "Unable to save the connection.");
    } finally {
      setPendingAction(null);
    }
  };

  const testConnection = async (): Promise<void> => {
    setPendingAction("test-connection");
    setMessage(null);
    setError(null);
    try {
      await apiClient.testConnection();
      setMessage("Connection test completed successfully.");
      await loadConfig();
    } catch (caughtError: unknown) {
      const typedError = caughtError as { message?: string };
      setError(typedError.message ?? "Connection test failed.");
    } finally {
      setPendingAction(null);
    }
  };

  const saveProjectMapping = async (): Promise<void> => {
    setPendingAction("mapping");
    setMessage(null);
    setError(null);
    try {
      await apiClient.saveProjectMapping(mappingPayload);
      setMessage("Project mapping saved.");
      await loadConfig();
    } catch (caughtError: unknown) {
      const typedError = caughtError as { message?: string };
      setError(typedError.message ?? "Unable to save the project mapping.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="shell">
      <div className="stack">
        <section className="card">
          <div className="eyebrow">Admin Page</div>
          <h1 className="title">Azure DevOps Connect</h1>
          <p className="muted">Configure the shared Azure connection and the Jira-to-repository mapping for the MVP.</p>
        </section>

        {message ? <div className="success">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <section className="card stack">
          <div>
            <div className="eyebrow">Connection</div>
            <h2 className="title">Azure DevOps credentials</h2>
          </div>
          <div className="row">
            <label>
              Organization name
              <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} />
            </label>
            <label>
              Personal access token
              <input
                type="password"
                value={personalAccessToken}
                onChange={(event) => setPersonalAccessToken(event.target.value)}
              />
            </label>
          </div>
          {adminConfig?.connection ? (
            <div className="muted">
              Current status: {adminConfig.connection.status}. Last test: {adminConfig.connection.lastConnectionTestAt ?? "Never"}.
            </div>
          ) : null}
          <div className="actions">
            <button disabled={pendingAction !== null} onClick={() => void saveConnection()}>
              {pendingAction === "connection" ? "Saving..." : "Save Connection"}
            </button>
            <button className="secondary" disabled={pendingAction !== null} onClick={() => void testConnection()}>
              {pendingAction === "test-connection" ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </section>

        <section className="card stack">
          <div>
            <div className="eyebrow">Mapping</div>
            <h2 className="title">Jira project mapping</h2>
          </div>
          <div className="row">
            <label>
              Jira project key
              <input
                value={mappingForm.jiraProjectKey}
                onChange={(event) => setMappingForm((current) => ({ ...current, jiraProjectKey: event.target.value }))}
              />
            </label>
            <label>
              Azure project name
              <input
                value={mappingForm.azureProjectName}
                onChange={(event) =>
                  setMappingForm((current) => ({ ...current, azureProjectName: event.target.value }))
                }
              />
            </label>
            <label>
              Repository name
              <input
                value={mappingForm.repositoryName}
                onChange={(event) => setMappingForm((current) => ({ ...current, repositoryName: event.target.value }))}
              />
            </label>
            <label>
              Base branch
              <input
                value={mappingForm.baseBranch}
                onChange={(event) => setMappingForm((current) => ({ ...current, baseBranch: event.target.value }))}
              />
            </label>
            <label>
              Max branch length
              <input
                type="number"
                value={mappingForm.maxBranchLength}
                onChange={(event) =>
                  setMappingForm((current) => ({
                    ...current,
                    maxBranchLength: Number(event.target.value) || 80
                  }))
                }
              />
            </label>
            <label>
              Branch template
              <input
                value={mappingForm.branchTemplate}
                onChange={(event) => setMappingForm((current) => ({ ...current, branchTemplate: event.target.value }))}
              />
            </label>
          </div>
          <label>
            Issue type prefix mapping
            <textarea
              value={mappingForm.prefixMappingText}
              onChange={(event) => setMappingForm((current) => ({ ...current, prefixMappingText: event.target.value }))}
            />
          </label>
          <div className="row">
            <label>
              Auto create branch
              <input
                type="checkbox"
                checked={mappingForm.autoCreateBranch}
                onChange={(event) =>
                  setMappingForm((current) => ({ ...current, autoCreateBranch: event.target.checked }))
                }
              />
            </label>
            <label>
              Normalize lowercase
              <input
                type="checkbox"
                checked={mappingForm.normalizeLowercase}
                onChange={(event) =>
                  setMappingForm((current) => ({ ...current, normalizeLowercase: event.target.checked }))
                }
              />
            </label>
            <label>
              Enabled
              <input
                type="checkbox"
                checked={mappingForm.enabled}
                onChange={(event) => setMappingForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
            </label>
          </div>
          <div className="actions">
            <button className="secondary" disabled={pendingAction !== null} onClick={() => void loadConfig()}>
              Reload Configuration
            </button>
            <button disabled={pendingAction !== null} onClick={() => void saveProjectMapping()}>
              {pendingAction === "mapping" ? "Saving..." : "Save Mapping"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export const App = (): JSX.Element => {
  const [context, setContext] = useState<ForgeViewContext | null>(null);

  useEffect(() => {
    void view.getContext().then((resolvedContext) => {
      setContext(resolvedContext as ForgeViewContext);
    });
  }, []);

  if (!context) {
    return (
      <div className="shell">
        <div className="card">Loading Azure DevOps Connect...</div>
      </div>
    );
  }

  if (context.extension?.issue?.key) {
    return <IssuePanel />;
  }

  return <AdminPage />;
};
