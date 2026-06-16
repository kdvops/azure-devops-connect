# API Contracts

## Resolver: getIssueBranchStatus

### Input

```json
{}
```

El issue debe resolverse desde el contexto Forge.

### Output

```json
{
  "status": "CREATED",
  "branchName": "feature/NS-125-google-login",
  "repositoryName": "nurse-shift",
  "baseBranch": "main",
  "branchUrl": "https://dev.azure.com/example/project/_git/repo?version=GBfeature%2FNS-125-google-login",
  "lastCommit": {
    "id": "abcdef123456",
    "shortId": "abcdef1",
    "message": "NS-125 Add Google login",
    "author": "Developer",
    "date": "2026-06-15T10:00:00Z",
    "url": "https://dev.azure.com/..."
  },
  "lastSyncAt": "2026-06-15T10:05:00Z",
  "error": null
}
```

## Resolver: createBranch

### Input

```json
{}
```

No aceptar issueId, projectId o repositoryId desde el frontend.

### Output

```json
{
  "status": "CREATED",
  "branchName": "feature/NS-125-google-login",
  "branchUrl": "https://dev.azure.com/..."
}
```

## Resolver: refreshBranch

### Input

```json
{}
```

### Output

Mismo contrato que `getIssueBranchStatus`.

## Resolver: saveProjectMapping

Solo accesible a administradores.

### Input

```json
{
  "jiraProjectId": "10001",
  "azureProjectId": "uuid",
  "repositoryId": "uuid",
  "baseBranch": "main",
  "autoCreateBranch": true,
  "branchTemplate": "{issueTypePrefix}/{issueKey}-{summarySlug}",
  "issueTypePrefixMapping": {
    "Story": "feature",
    "Task": "feature",
    "Bug": "bugfix"
  }
}
```

## Azure DevOps REST API

### Obtener refs

`GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/refs?filter=heads/{branch}&api-version=7.1`

### Crear ref

`POST https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/refs?api-version=7.1`

Body conceptual:

```json
[
  {
    "name": "refs/heads/feature/NS-125-google-login",
    "oldObjectId": "0000000000000000000000000000000000000000",
    "newObjectId": "BASE_BRANCH_OBJECT_ID"
  }
]
```

### Obtener commits

`GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/commits?searchCriteria.itemVersion.version={branch}&searchCriteria.$top=1&api-version=7.1`
