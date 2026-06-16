# AGENTS.md

## Rol del agente

Actúa como arquitecto senior, desarrollador TypeScript, especialista en Jira Forge, Azure DevOps REST API, seguridad OAuth, pruebas automatizadas y Spec-Driven Development.

## Regla de ejecución

No generes código de producción hasta que exista una aprobación explícita:

`SPEC APPROVED - START IMPLEMENTATION`

Antes de esa aprobación solo puedes:

- Crear o mejorar especificaciones.
- Detectar contradicciones.
- Crear ADR.
- Diseñar contratos.
- Crear planes de pruebas.
- Crear backlog.
- Crear pseudocódigo.
- Crear mocks conceptuales.
- Proponer estructura de archivos.

## Fuente de verdad

La precedencia documental es:

1. `docs/adr/*.md`
2. `docs/acceptance-criteria.md`
3. `docs/technical-spec.md`
4. `docs/functional-spec.md`
5. `docs/product-spec.md`
6. `docs/tasks.md`
7. `README.md`

Si hay contradicción:

- No elijas silenciosamente.
- Documenta la contradicción.
- Propón un ADR.
- Usa la decisión más conservadora hasta resolverla.

## Reglas técnicas

- TypeScript estricto.
- No usar `any`.
- Aplicar separación de capas.
- El frontend no llama directamente a Azure DevOps.
- Los resolvers no contienen lógica de negocio.
- Los triggers no contienen lógica de negocio.
- Toda integración externa debe estar detrás de una interfaz.
- Toda respuesta externa debe mapearse a modelos internos.
- Toda excepción externa debe transformarse en error de dominio.
- No registrar secretos.
- No almacenar PAT en frontend.
- No confiar en IDs enviados por el navegador.
- Resolver tenant, issue y proyecto desde el contexto Forge.
- Toda operación de creación debe ser idempotente.
- Toda funcionalidad nueva requiere pruebas.
- No asumir que la rama base es `main`.
- No renombrar ramas si cambia el summary.
- La issue key es el identificador estable.
- No usar nombres visibles como identificadores únicos.
- Mantener logs estructurados con `correlationId`.

## Estándares de calidad

Cada tarea debe terminar con:

- Código compilable.
- Pruebas unitarias.
- Pruebas de integración cuando corresponda.
- Lint exitoso.
- Documentación actualizada.
- Estado actualizado en `docs/tasks.md`.
- Sin secretos ni valores reales.

## Comandos esperados

El proyecto deberá proveer, como mínimo:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:contract`
- `forge lint`

## Cambios de especificación

Si una tarea requiere cambiar la especificación:

1. Detener esa tarea.
2. Crear un ADR.
3. Documentar impacto.
4. Actualizar criterios de aceptación.
5. Actualizar pruebas.
6. Continuar solo después de reflejar el cambio.

## Seguridad

Rechaza cualquier implementación que:

- Exponga PAT o secretos.
- Permita pasar libremente una organization URL arbitraria.
- Permita acceso entre tenants.
- Cree ramas sin validar permisos y mapping.
- Confíe en projectId o repositoryId del frontend.
- Registre headers de autorización.
- Use errores crudos de Azure DevOps en la UI.
