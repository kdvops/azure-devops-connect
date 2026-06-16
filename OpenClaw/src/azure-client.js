/**
 * Azure DevOps API Client
 * 
 * Handles all communication with Azure DevOps REST API.
 * Uses PAT token stored in Forge storage for authentication.
 */

const STORAGE_KEY = 'azure-devops-config';

/**
 * Get Azure DevOps configuration from Forge storage
 */
export async function getConfig() {
  const storage = await import('@forge/api');
  const config = await storage.storage.get(STORAGE_KEY);
  return config || null;
}

/**
 * Save Azure DevOps configuration
 */
export async function saveConfig(config) {
  const storage = await import('@forge/api');
  await storage.storage.set(STORAGE_KEY, config);
}

/**
 * Get the latest commit object ID from a source branch
 * 
 * @param {string} organization - Azure DevOps org name
 * @param {string} project - Project name or ID
 * @param {string} repositoryId - Repository ID or name
 * @param {string} branchName - Source branch (e.g., "main", "develop")
 * @returns {Promise<string>} - The commit object ID
 */
async function getLatestCommit(organization, project, repositoryId, branchName, pat) {
  const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/refs?filter=heads/${branchName}&api-version=7.0`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${btoa(':' + pat)}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get latest commit: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.value || data.value.length === 0) {
    throw new Error(`Branch '${branchName}' not found in repository`);
  }

  return data.value[0].objectId;
}

/**
 * Create a new branch in Azure DevOps
 * 
 * @param {Object} params
 * @param {string} params.organization - Azure DevOps org
 * @param {string} params.project - Project name
 * @param {string} params.repositoryId - Repo ID or name
 * @param {string} params.branchName - New branch name (without refs/heads/)
 * @param {string} params.sourceBranch - Source branch to branch from (e.g., "main")
 * @param {string} params.pat - Personal Access Token
 * @returns {Promise<Object>} - Created ref info
 */
export async function createBranch({ organization, project, repositoryId, branchName, sourceBranch = 'main', pat }) {
  // Get the latest commit from source branch
  const latestCommitId = await getLatestCommit(organization, project, repositoryId, sourceBranch, pat);

  // Create the new branch ref
  const refName = `refs/heads/${branchName}`;
  const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repositoryId)}/refs?api-version=7.0`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(':' + pat)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        name: refName,
        oldObjectId: '0000000000000000000000000000000000000000',
        newObjectId: latestCommitId,
      },
    ]),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create branch: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    refName: data.value?.[0]?.name || refName,
    repositoryId,
    commitId: latestCommitId.substring(0, 8),
    url: `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_git/${encodeURIComponent(repositoryId)}?version=GB${branchName}`,
  };
}

/**
 * Get repository details (to list available repos for config)
 */
export async function getRepositories(organization, project, pat) {
  const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/git/repositories?api-version=7.0`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${btoa(':' + pat)}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get repositories: ${response.status}`);
  }

  const data = await response.json();
  return data.value.map(repo => ({
    id: repo.id,
    name: repo.name,
    defaultBranch: repo.defaultBranch?.replace('refs/heads/', '') || 'main',
    webUrl: repo.webUrl,
  }));
}

/**
 * Get projects from Azure DevOps (for config setup)
 */
export async function getProjects(organization, pat) {
  const url = `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${btoa(':' + pat)}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get projects: ${response.status}`);
  }

  const data = await response.json();
  return data.value.map(project => ({
    id: project.id,
    name: project.name,
  }));
}

/**
 * Generate a branch name from a Jira issue
 * 
 * @param {string} issueKey - Jira issue key (e.g., "SCRUM-42")
 * @param {string} summary - Issue summary/title
 * @returns {string} - Branch name
 */
export function generateBranchName(issueKey, summary) {
  // Convert summary to kebab-case, remove special chars, limit length
  const cleanSummary = summary
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  return `feature/${issueKey}-${cleanSummary}`;
}
