# Product Specification

## Producto

Jira Azure DevOps Branch Manager.

## Problema

Los desarrolladores deben crear manualmente ramas Git asociadas a issues Jira, lo que genera inconsistencias en nombres, pérdida de trazabilidad y trabajo repetitivo.

## Propuesta de valor

Crear y administrar la rama asociada a cada issue directamente desde Jira, con visibilidad sobre su existencia y último commit.

## Usuarios

- Jira Administrator.
- Project Administrator.
- Jira User.
- Equipo DevOps.
- Equipo de auditoría.

## Objetivos

- Reducir trabajo manual.
- Estandarizar nombres de ramas.
- Mejorar trazabilidad Jira-Azure DevOps.
- Evitar ramas duplicadas.
- Mostrar estado y actividad de la rama desde Jira.

## Funcionalidades MVP

- Configurar conexión Azure DevOps.
- Mapear proyecto Jira a proyecto y repositorio Azure DevOps.
- Configurar rama base.
- Crear rama al crear issue.
- Crear rama manualmente.
- Consultar si existe.
- Consultar último commit.
- Abrir rama en Azure DevOps.
- Reintentar errores.
- Mostrar estado.
- Registrar auditoría básica.

## Fuera de alcance

- Pull Requests.
- Builds.
- Pipelines.
- Deployments.
- Azure Boards.
- Merge.
- Eliminación de ramas.
- Renombrado automático.
- Jira Data Center.
- Azure DevOps Server.
- Marketplace en primera versión.

## Métricas de éxito

- Porcentaje de issues con rama creada correctamente.
- Tiempo medio desde issue creado hasta rama creada.
- Tasa de fallos.
- Tasa de duplicados evitados.
- Uso de creación manual.
- Tiempo de carga del panel.
