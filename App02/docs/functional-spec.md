# Functional Specification

## Flujo principal

1. Se crea un issue Jira.
2. Forge recibe el evento.
3. Se obtiene la configuración del proyecto.
4. Se genera el nombre de rama.
5. Se verifica idempotencia.
6. Se consulta la rama base.
7. Se crea la nueva referencia Git.
8. Se persiste el vínculo issue-rama.
9. El panel del issue muestra la información.
10. El usuario puede refrescar o reintentar.

## Convención predeterminada

`{issueTypePrefix}/{issueKey}-{summarySlug}`

Ejemplo:

`feature/NS-125-google-login`

## Reglas del nombre

- Soporta plantilla configurable.
- Puede convertir a minúsculas.
- Reemplaza espacios por guiones.
- Elimina caracteres inválidos.
- Colapsa guiones múltiples.
- No permite `..`.
- No termina con punto o slash.
- Conserva siempre la issue key.
- Tiene longitud máxima configurable.
- La salida es determinista.

## Estados

- `NOT_CONFIGURED`
- `PENDING`
- `CREATING`
- `CREATED`
- `ALREADY_EXISTS`
- `FAILED`
- `DISABLED`

## Panel del issue

Debe mostrar:

- Estado.
- Rama.
- Proyecto Azure DevOps.
- Repositorio.
- Rama base.
- Último commit.
- Hash corto.
- Mensaje.
- Autor.
- Fecha.
- Última sincronización.
- Error seguro.
- Enlace a Azure DevOps.

## Acciones

- Create branch.
- Retry.
- Refresh.
- Open in Azure DevOps.
- Copy branch name.

## Configuración administrativa

Por instalación:

- Organización Azure DevOps.
- Tipo de autenticación.
- Estado de conexión.

Por proyecto:

- Integración habilitada.
- Proyecto Azure DevOps.
- Repositorio.
- Rama base.
- Creación automática.
- Plantilla de nombre.
- Mapping de issue types.
- Longitud máxima.
- Normalización.
- Política si la rama existe.

## Errores funcionales

- `CONFIGURATION_NOT_FOUND`
- `AZURE_CONNECTION_FAILED`
- `AZURE_UNAUTHORIZED`
- `AZURE_FORBIDDEN`
- `AZURE_PROJECT_NOT_FOUND`
- `REPOSITORY_NOT_FOUND`
- `BASE_BRANCH_NOT_FOUND`
- `BRANCH_ALREADY_EXISTS`
- `INVALID_BRANCH_NAME`
- `RATE_LIMITED`
- `AZURE_SERVICE_UNAVAILABLE`
- `NETWORK_ERROR`
- `STORAGE_ERROR`
- `UNKNOWN_ERROR`
