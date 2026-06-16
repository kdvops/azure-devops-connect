# Architecture

## Decisión inicial

Usar Forge Custom UI + Forge Functions + Forge Storage + Azure DevOps REST API.

## Motivo

Es la arquitectura más simple para un MVP y evita desplegar infraestructura adicional.

## Diagrama

```text
Jira Cloud
   |
   +-- issuePanel
   +-- adminPage
   +-- issueCreated trigger
          |
          v
     Forge Functions
          |
          +-- Application Layer
          +-- Domain Layer
          +-- Forge Storage
          |
          v
 Azure DevOps REST API
```

## Límites

Forge Functions no deben contener lógica de negocio directamente.

## Evolución futura

Migrar a Forge Remote cuando:

- Haya procesamiento intensivo.
- Se requieran colas.
- Se necesite PostgreSQL.
- Se necesite mayor control de observabilidad.
- Se requiera multi-tenant avanzado.
- Se superen límites de Forge.
- Se integren pipelines, PR o deployments.

## Componentes reemplazables

- Forge Storage puede reemplazarse por PostgreSQL.
- Credential provider puede migrar de PAT a OAuth.
- AzureDevOpsGitClient no debe cambiar.
- UI no debe depender de la persistencia.
