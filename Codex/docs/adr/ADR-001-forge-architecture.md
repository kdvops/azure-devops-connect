# ADR-001 Forge Architecture

## Estado

Aceptado para MVP.

## Decisión

Usar Forge Custom UI, Forge Functions y Forge Storage.

## Motivo

- Menor complejidad operativa.
- No requiere backend adicional.
- Adecuado para MVP interno.
- Integración nativa con Jira.

## Consecuencias

- Dependencia de límites Forge.
- Persistencia limitada.
- Procesamiento pesado no recomendado.

## Evolución

Migrar a Forge Remote y PostgreSQL cuando el producto lo requiera.
