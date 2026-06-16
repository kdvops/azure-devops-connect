# Technical Specification

## Stack inicial

- Jira Forge.
- TypeScript.
- React.
- Custom UI.
- Forge functions.
- Forge resolvers.
- Forge trigger para issue created.
- Forge Storage para MVP.
- Azure DevOps REST API.
- Vitest o Jest.
- ESLint.
- Prettier.

## Arquitectura por capas

### Presentation

- Custom UI.
- Issue panel.
- Admin page.

### Application

- Use cases.
- Orquestación.
- Políticas de reintento.
- Idempotencia.

### Domain

- Entidades.
- Value objects.
- Estados.
- Errores.
- Reglas de naming.

### Infrastructure

- Azure DevOps client.
- Forge Storage repositories.
- Credential provider.
- Logger.
- Retry adapter.

## Interfaces principales

### AzureDevOpsGitClient

- `testConnection`
- `getProject`
- `getRepository`
- `getBranch`
- `branchExists`
- `getBranchHeadCommit`
- `getLatestCommit`
- `createBranch`
- `buildBranchUrl`

### ProjectMappingRepository

- `getByJiraProjectId`
- `save`
- `update`
- `delete`
- `list`

### IssueBranchRepository

- `getByIssueId`
- `save`
- `update`
- `findByIdempotencyKey`

### AzureDevOpsCredentialProvider

- `getCredential`
- `rotateCredential`
- `validateCredential`

## Operaciones principales

### CreateIssueBranch

1. Resolver installation.
2. Resolver issue.
3. Resolver mapping.
4. Generar nombre.
5. Construir idempotency key.
6. Buscar vínculo existente.
7. Consultar rama.
8. Consultar rama base.
9. Crear rama.
10. Confirmar creación.
11. Persistir vínculo.
12. Registrar resultado.

### RefreshIssueBranch

1. Resolver vínculo.
2. Consultar rama.
3. Consultar commit.
4. Actualizar caché.
5. Retornar DTO seguro.

## Política de reintentos

Reintentar:

- 429.
- 500.
- 502.
- 503.
- 504.
- Timeout.
- Error de red transitorio.

No reintentar:

- 400.
- 401.
- 403.
- 404 de configuración.
- Nombre inválido.

## Seguridad

- Secretos solo backend.
- Scopes mínimos.
- Allowlist de hosts Azure DevOps.
- Validación estricta de URLs.
- No exponer errores crudos.
- No confiar en IDs del frontend.
- Auditoría de operaciones.
