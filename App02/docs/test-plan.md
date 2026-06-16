# Test Plan

## Unit tests

- BranchNameGenerator.
- Sanitización.
- Mapping de issue types.
- Límite de longitud.
- Idempotency key.
- Error mapping.
- Retry policy.
- URL builder.
- DTO mapping.

## Integration tests

- Resolver con repositorios mock.
- Trigger issue created.
- Guardado de ProjectMapping.
- Guardado de IssueBranchLink.
- Evento duplicado.
- Rama existente.
- Error temporal.
- Error no reintentable.

## Contract tests

Azure DevOps:

- Branch found.
- Branch missing.
- Branch created.
- Conflict.
- Unauthorized.
- Forbidden.
- Not found.
- Rate limited.
- Service unavailable.

## E2E

- Configurar conexión.
- Configurar mapping.
- Crear issue.
- Verificar rama.
- Abrir panel.
- Ver último commit.
- Reintentar.
- Deshabilitar auto-create.

## Security tests

- repositoryId manipulado.
- issueKey manipulado.
- host malicioso.
- token ausente.
- token inválido.
- acceso entre tenants.
- branch name con caracteres inválidos.
