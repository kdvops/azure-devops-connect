# Runbook

## Diagnóstico de fallo al crear rama

1. Revisar estado en issue panel.
2. Obtener correlationId.
3. Consultar OperationLog.
4. Verificar mapping del proyecto.
5. Probar conexión Azure DevOps.
6. Verificar repositorio.
7. Verificar rama base.
8. Verificar permisos.
9. Corregir configuración.
10. Ejecutar Retry.

## Rotación de PAT

1. Crear PAT nuevo con permisos mínimos.
2. Actualizar secreto.
3. Probar conexión.
4. Revocar PAT anterior.
5. Registrar auditoría.

## Azure DevOps no disponible

- Mantener último estado conocido.
- No bloquear apertura del issue.
- Reintentar errores transitorios.
- Permitir reintento manual.

## Rama ya existente

- No crear otra.
- Validar que pertenece al repositorio configurado.
- Vincularla.
- Marcar ALREADY_EXISTS.
