# Create Branch Specification

## Precondiciones

- Integración habilitada.
- Mapping existente.
- Credencial disponible.
- Repositorio accesible.
- Rama base existente.

## Flujo

1. Resolver issue.
2. Resolver mapping.
3. Generar nombre.
4. Crear idempotency key.
5. Buscar vínculo.
6. Consultar rama.
7. Si existe, vincular.
8. Consultar objectId base.
9. Crear ref.
10. Confirmar.
11. Persistir.
12. Auditar.

## Resultado

- CREATED.
- ALREADY_EXISTS.
- FAILED.
- NOT_CONFIGURED.
- DISABLED.

## Idempotencia

Procesar el mismo evento varias veces no crea más de una rama.
