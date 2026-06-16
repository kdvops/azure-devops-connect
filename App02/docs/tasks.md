# Tasks

## TASK-001 Inicializar proyecto Forge

Objetivo:
Crear el proyecto base.

Estado:
COMPLETED

Nota:
Proyecto base implementado y validado con `npm install`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:unit`, `npm run test:integration`, `npm run test:contract` y `forge lint`.

Dependencias:
Ninguna.

Archivos:
- manifest.yml
- package.json
- tsconfig.json
- eslint.config.js
- vitest.config.ts

Criterios:
- npm install funciona.
- npm run build funciona.
- npm run lint funciona.
- npm test funciona.
- forge lint funciona.

## TASK-002 Crear estructura por capas

Estado:
COMPLETED

Dependencias:
TASK-001.

Resultado:
Directorios domain, application, infrastructure, presentation y shared.

## TASK-003 Implementar BranchNameGenerator

Estado:
COMPLETED

Dependencias:
TASK-002.

Criterios:
- Salida determinista.
- Maneja caracteres inválidos.
- Conserva issue key.
- Respeta longitud.
- 100% cobertura de reglas críticas.

## TASK-004 Implementar errores de dominio

Dependencias:
TASK-002.

Resultado:
Catálogo de errores y mapper seguro.

## TASK-005 Implementar entidades y estados

Dependencias:
TASK-002.

Resultado:
ProjectMapping, IssueBranchLink, OperationLog y estados.

## TASK-006 Implementar repositorios abstractos

Dependencias:
TASK-005.

Resultado:
Interfaces de persistencia.

## TASK-007 Implementar Forge Storage repositories

Dependencias:
TASK-006.

Criterios:
- Aislamiento por installationId.
- Claves únicas.
- Tests de integración.

## TASK-008 Implementar CredentialProvider

Dependencias:
TASK-002.

Resultado:
Abstracción para PAT y futura migración.

## TASK-009 Implementar AzureDevOpsHttpClient

Dependencias:
TASK-008.

Criterios:
- Timeout.
- Retry.
- Sanitización.
- CorrelationId.

## TASK-010 Implementar AzureDevOpsGitClient

Dependencias:
TASK-009.

Criterios:
- getBranch.
- createBranch.
- getLatestCommit.
- buildBranchUrl.
- Contract tests.

## TASK-011 Implementar CreateIssueBranch

Dependencias:
TASK-003, TASK-007, TASK-010.

Criterios:
- Idempotencia.
- Rama existente.
- Rama base inexistente.
- Persistencia.
- Auditoría.

## TASK-012 Implementar GetIssueBranchStatus

Dependencias:
TASK-007, TASK-010.

## TASK-013 Implementar RefreshIssueBranch

Dependencias:
TASK-007, TASK-010.

## TASK-014 Implementar trigger issue created

Dependencias:
TASK-011.

Criterios:
- Resuelve contexto.
- Invoca caso de uso.
- No contiene lógica de negocio.

## TASK-015 Implementar resolvers del issue panel

Dependencias:
TASK-011, TASK-012, TASK-013.

## TASK-016 Implementar resolvers administrativos

Dependencias:
TASK-007, TASK-010.

Criterios:
- Verificación de permisos.
- Probar conexión.
- Guardar mapping.

## TASK-017 Implementar admin page

Dependencias:
TASK-016.

## TASK-018 Implementar issue panel

Dependencias:
TASK-015.

## TASK-019 Agregar observabilidad

Dependencias:
TASK-011 a TASK-018.

## TASK-020 Ejecutar hardening de seguridad

Dependencias:
TASK-019.

## TASK-021 Crear pruebas E2E

Dependencias:
TASK-017, TASK-018.

## TASK-022 Crear runbook

Dependencias:
TASK-021.
