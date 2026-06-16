# ADR-003 Storage Strategy

## Estado

Aceptado para MVP.

## Decisión

Usar Forge Storage.

## Reglas

- Todas las claves incluyen installationId.
- No almacenar secretos en registros funcionales.
- Modelos versionados.
- Repositorios detrás de interfaces.

## Evolución

Migrar a PostgreSQL o Azure SQL sin modificar casos de uso.
