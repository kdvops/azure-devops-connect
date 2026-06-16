# Jira Azure DevOps Branch Manager

Repositorio de especificaciones para construir una aplicación Jira Forge que conecte issues de Jira Cloud con ramas Git en Azure DevOps.

## Objetivo

Cuando se cree un issue en Jira:

1. Identificar el proyecto Jira.
2. Resolver el mapping hacia Azure DevOps.
3. Generar un nombre de rama.
4. Crear la rama desde una rama base.
5. Guardar la relación issue-rama.
6. Mostrar estado, enlace y último commit dentro de Jira.

## Regla principal

No generar código de producción hasta que las especificaciones sean revisadas y aprobadas.

La implementación comienza únicamente cuando el usuario indique:

`SPEC APPROVED - START IMPLEMENTATION`

## Orden recomendado para Codex

1. Leer `AGENTS.md`.
2. Leer `docs/product-spec.md`.
3. Leer `docs/functional-spec.md`.
4. Leer `docs/technical-spec.md`.
5. Leer `docs/architecture.md`.
6. Leer `docs/tasks.md`.
7. Leer los ADR en `docs/adr/`.
8. Ejecutar `prompts/01-generate-spec.md`.
9. Tras aprobación, ejecutar `prompts/02-start-implementation.md`.

## Alcance del MVP

Incluye:

- Jira Cloud.
- Jira Forge.
- Custom UI.
- Azure DevOps Services.
- Azure Repos Git.
- Creación automática y manual de ramas.
- Estado de rama.
- Último commit.
- Configuración por proyecto Jira.
- Reintentos.
- Idempotencia.
- Auditoría básica.

No incluye:

- Pull Requests.
- Pipelines.
- Builds.
- Deployments.
- Merge.
- Eliminación de ramas.
- Azure DevOps Server.
- Jira Data Center.
