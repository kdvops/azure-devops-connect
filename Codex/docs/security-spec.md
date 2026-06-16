# Security Specification

## Principios

- Least privilege.
- Defense in depth.
- Tenant isolation.
- Secret minimization.
- Input validation.
- Safe error handling.
- Auditability.

## Secretos

- Nunca en frontend.
- Nunca en logs.
- Nunca en repositorio.
- Nunca en respuestas de resolver.
- PAT solo para MVP interno.
- Preparar migración a OAuth o Service Principal.

## Validaciones

- Organization URL en allowlist.
- Solo dominios Azure DevOps permitidos.
- Project y repository resueltos desde configuración persistida.
- Issue y project resueltos desde contexto Forge.
- Branch name validado antes de llamar Azure DevOps.
- URLs construidas, no concatenadas desde input libre.

## Permisos

### Jira Administrator

- Administrar conexión.
- Administrar mappings.
- Probar conexión.
- Consultar logs.

### Project Administrator

- Administrar mapping del proyecto si está habilitado.

### Jira User

- Consultar rama.
- Crear rama manualmente si está autorizado.
- Refrescar.
- Reintentar.

## Logging

Permitido:

- correlationId.
- installationId.
- issueKey.
- operationType.
- duración.
- status.
- errorCode.

Prohibido:

- PAT.
- Authorization header.
- Cookies.
- Payload completo de credenciales.
- Errores crudos de terceros.
