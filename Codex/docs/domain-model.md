# Domain Model

## JiraInstallation

- id
- jiraCloudId
- installationContext
- status
- createdAt
- updatedAt

## AzureDevOpsConnection

- id
- jiraInstallationId
- organizationName
- organizationUrl
- authenticationType
- encryptedCredentialReference
- status
- lastConnectionTest
- createdAt
- updatedAt

## ProjectMapping

- id
- jiraInstallationId
- jiraProjectId
- jiraProjectKey
- azureProjectId
- azureProjectName
- repositoryId
- repositoryName
- baseBranch
- autoCreateBranch
- branchTemplate
- issueTypePrefixMapping
- maxBranchLength
- normalizeLowercase
- enabled
- createdAt
- updatedAt

## IssueBranchLink

- id
- jiraInstallationId
- jiraIssueId
- jiraIssueKey
- jiraProjectId
- repositoryId
- branchName
- baseBranch
- branchUrl
- creationStatus
- lastKnownCommitId
- lastKnownCommitMessage
- lastKnownCommitAuthor
- lastKnownCommitDate
- lastSyncAt
- createdAt
- updatedAt

## OperationLog

- id
- installationId
- issueId
- issueKey
- operationType
- correlationId
- status
- errorCode
- sanitizedErrorMessage
- attempt
- createdAt
- completedAt

## Claves únicas

- ProjectMapping: installationId + jiraProjectId.
- IssueBranchLink: installationId + jiraIssueId + repositoryId.
- OperationLog: correlationId + operationType.

## Idempotency key

`installationId:jiraIssueId:repositoryId:branchName`
