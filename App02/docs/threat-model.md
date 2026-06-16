# Threat Model - STRIDE

## Spoofing

Amenaza:
Usuario intenta ejecutar acciones sobre otro proyecto.

Mitigación:
Resolver issue y proyecto desde Forge context. No aceptar IDs confiables desde frontend.

## Tampering

Amenaza:
Manipulación de repositoryId o branch name.

Mitigación:
RepositoryId desde ProjectMapping persistido. Branch name generado y validado en backend.

## Repudiation

Amenaza:
Usuario niega haber creado una rama.

Mitigación:
OperationLog con actor, issue, timestamp, correlationId y resultado.

## Information Disclosure

Amenaza:
Exposición de PAT o respuestas internas.

Mitigación:
Sanitización de errores, secreto solo backend y logs estructurados sin headers.

## Denial of Service

Amenaza:
Creación masiva de ramas.

Mitigación:
Rate limiting, idempotencia, permisos y throttling por installation.

## Elevation of Privilege

Amenaza:
Usuario normal modifica configuración.

Mitigación:
Validación de permisos Jira en resolver administrativo.

## SSRF

Amenaza:
Organization URL controlada por usuario.

Mitigación:
Allowlist estricta para `https://dev.azure.com/{organization}` y rechazo de hosts arbitrarios.

## Cross-tenant access

Amenaza:
Acceso a mappings de otra instalación.

Mitigación:
Todas las claves de almacenamiento incluyen installationId.
