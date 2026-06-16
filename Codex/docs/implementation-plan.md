# Implementation Plan

## Fase 1 - Foundation

- Inicializar Forge.
- Configurar TypeScript.
- Configurar lint y tests.
- Crear estructura de capas.

## Fase 2 - Domain

- Estados.
- Errores.
- BranchNameGenerator.
- IdempotencyKey.
- Entidades.

## Fase 3 - Persistence

- ProjectMappingRepository.
- IssueBranchRepository.
- OperationLogRepository.
- Implementación Forge Storage.

## Fase 4 - Azure DevOps

- HTTP client.
- Credential provider.
- Git client.
- Error mapper.
- Contract tests.

## Fase 5 - Use cases

- ConfigureConnection.
- SaveProjectMapping.
- CreateIssueBranch.
- GetIssueBranchStatus.
- RefreshIssueBranch.
- RetryIssueBranch.

## Fase 6 - Forge modules

- Trigger issue created.
- Issue panel resolver.
- Admin resolver.
- Permission checks.

## Fase 7 - UI

- Admin page.
- Issue panel.
- Estados.
- Acciones.
- Errores.

## Fase 8 - Hardening

- Observabilidad.
- Security tests.
- E2E.
- Runbook.
