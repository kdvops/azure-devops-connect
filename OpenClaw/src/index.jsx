import ForgeUI, { 
  render, 
  IssuePanel, 
  Text, 
  Button, 
  Fragment, 
  useAction, 
  useState, 
  useProductContext, 
  Table, 
  Cell, 
  Heading, 
  TextField, 
  ModalDialog,
  Form,
} from '@forge/ui';
import api, { storage, route } from '@forge/api';
import { generateBranchName } from './azure-client';

const CONFIG_KEY = 'azure-devops-config';

/**
 * Get config from storage (runs on backend via useAction)
 */
async function loadConfig() {
  return await storage.get(CONFIG_KEY);
}

/**
 * Save config to storage (runs on backend via useAction)
 */
async function saveConfigToStorage(config) {
  await storage.set(CONFIG_KEY, config);
  return { success: true };
}

/**
 * Get branch info for an issue (runs on backend)
 */
async function getStoredBranchInfo(issueKey) {
  return await storage.get(`branch-${issueKey}`);
}

/**
 * Create branch via Azure DevOps API (runs on backend)
 */
async function createBranchInAzure(config, issueKey, issueSummary) {
  const branchName = generateBranchName(issueKey, issueSummary || '');

  // Get latest commit from source branch
  const sourceBranch = config.sourceBranch || 'main';
  const refUrl = `https://dev.azure.com/${config.organization}/${encodeURIComponent(config.project)}/_apis/git/repositories/${encodeURIComponent(config.repositoryId)}/refs?filter=heads/${sourceBranch}&api-version=7.0`;

  const refResponse = await fetch(refUrl, {
    headers: { 'Authorization': `Basic ${btoa(':' + config.pat)}` }
  });

  if (!refResponse.ok) {
    throw new Error(`Cannot access source branch '${sourceBranch}'`);
  }

  const refData = await refResponse.json();
  if (!refData.value || refData.value.length === 0) {
    throw new Error(`Source branch '${sourceBranch}' not found`);
  }

  const latestCommitId = refData.value[0].objectId;

  // Create the new branch
  const createUrl = `https://dev.azure.com/${config.organization}/${encodeURIComponent(config.project)}/_apis/git/repositories/${encodeURIComponent(config.repositoryId)}/refs?api-version=7.0`;

  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(':' + config.pat)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      name: `refs/heads/${branchName}`,
      oldObjectId: '0000000000000000000000000000000000000000',
      newObjectId: latestCommitId,
    }]),
  });

  if (!createResponse.ok) {
    const errBody = await createResponse.text();
    throw new Error(`Branch creation failed: ${errBody}`);
  }

  const result = await createResponse.json();
  const commitShort = latestCommitId.substring(0, 8);

  const branchInfo = {
    branchName,
    commitId: commitShort,
    createdAt: new Date().toISOString(),
    issueKey,
    repoUrl: `https://dev.azure.com/${config.organization}/${encodeURIComponent(config.project)}/_git/${encodeURIComponent(config.repositoryId)}?version=GB${branchName}`,
  };

  // Store for future reference
  await storage.set(`branch-${issueKey}`, branchInfo);

  return branchInfo;
}

/**
 * Main Issue Panel component
 */
const App = () => {
  const context = useProductContext();
  const issueKey = context.platformContext?.issueKey;
  const issueSummary = context.platformContext?.issueSummary || '';

  const [config, setConfig] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  // Initialize: load config + check existing branch
  useState(async () => {
    try {
      const savedConfig = await loadConfig();
      setConfig(savedConfig);

      if (savedConfig && issueKey) {
        const existing = await getStoredBranchInfo(issueKey);
        if (existing) {
          setBranchInfo(existing);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Action: create branch
  const onCreateBranch = useAction(async () => {
    setLoading(true);
    setError(null);

    try {
      const cfg = await loadConfig();
      if (!cfg) throw new Error('Azure DevOps not configured');

      // Check if branch already exists
      const existing = await getStoredBranchInfo(issueKey);
      if (existing) {
        setBranchInfo(existing);
        return;
      }

      const info = await createBranchInAzure(cfg, issueKey, issueSummary);
      setBranchInfo(info);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  // Action: save config
  const onSaveConfig = useAction(async (formData) => {
    try {
      const newConfig = {
        organization: formData.organization,
        project: formData.project,
        repositoryId: formData.repositoryId,
        sourceBranch: formData.sourceBranch || 'main',
        pat: formData.pat,
      };
      await saveConfigToStorage(newConfig);
      setConfig(newConfig);
      setShowConfig(false);
    } catch (err) {
      setError(err.message);
    }
  });

  // --- RENDER ---

  return (
    <Fragment>
      {/* Config modal */}
      {showConfig && (
        <ModalDialog header="⚙️ Azure DevOps Configuration" onClose={() => setShowConfig(false)}>
          <Form onSubmit={onSaveConfig}>
            <TextField label="Organization" name="organization"
              placeholder="e.g., the-punisher01"
              defaultValue={config?.organization} />
            <TextField label="Project Name" name="project"
              placeholder="e.g., MyProject"
              defaultValue={config?.project} />
            <TextField label="Repository Name" name="repositoryId"
              placeholder="e.g., my-repo"
              defaultValue={config?.repositoryId} />
            <TextField label="Source Branch" name="sourceBranch"
              placeholder="main"
              defaultValue={config?.sourceBranch || 'main'} />
            <TextField label="Personal Access Token" name="pat"
              type="password"
              placeholder="Azure DevOps PAT"
              defaultValue={config?.pat} />
            <Button text="💾 Save Connection" submit appearance="primary" />
          </Form>
        </ModalDialog>
      )}

      {/* Error */}
      {error && (
        <Fragment>
          <Text>❌ <Text appearance="error">{error}</Text></Text>
          <Text> </Text>
        </Fragment>
      )}

      {/* Branch linked */}
      {branchInfo && (
        <Fragment>
          <Heading text="✅ Connected to Branch" />
          <Table>
            <Cell>
              <Text><strong>Branch:</strong> {branchInfo.branchName}</Text>
              <Text><strong>Commit:</strong> {branchInfo.commitId}</Text>
              <Text><strong>Created:</strong> {new Date(branchInfo.createdAt).toLocaleDateString()}</Text>
            </Cell>
          </Table>
          <Button text="🔗 Open in Azure DevOps" href={branchInfo.repoUrl} appearance="link" />
          <Text> </Text>
          <Button text="🔄 Create Pull Request"
            href={`${branchInfo.repoUrl}&createPR=true`}
            appearance="primary" />
          <Text> </Text>
          <Button text="⚙️ Settings" onClick={() => setShowConfig(true)} appearance="link" />
        </Fragment>
      )}

      {/* No config yet */}
      {!config && !branchInfo && (
        <Fragment>
          <Heading text="🚀 Azure DevOps Connect" />
          <Text>Connect Jira issues with Azure DevOps branches.</Text>
          <Text> </Text>
          <Text>Configure your Azure DevOps connection to get started.</Text>
          <Text> </Text>
          <Button text="⚙️ Configure Connection" onClick={() => setShowConfig(true)} appearance="primary" />
        </Fragment>
      )}

      {/* Configured, waiting for branch creation */}
      {config && !branchInfo && (
        <Fragment>
          <Heading text="🌿 Azure DevOps Branch" />
          <Text>Connected to: <strong>{config.project}/{config.repositoryId}</strong></Text>
          <Text> </Text>
          {loading ? (
            <Text>⏳ Creating branch...</Text>
          ) : (
            <Fragment>
              <Text><strong>Branch name:</strong></Text>
              <Text>{generateBranchName(issueKey, issueSummary)}</Text>
              <Text> </Text>
              <Button text="🌿 Create Branch" onClick={onCreateBranch} appearance="primary" />
              <Text> </Text>
              <Button text="⚙️ Settings" onClick={() => setShowConfig(true)} appearance="link" />
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

/**
 * Render the issue panel
 */
export const handler = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
