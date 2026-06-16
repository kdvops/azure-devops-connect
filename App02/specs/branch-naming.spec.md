# Branch Naming Specification

## Input

- issueKey.
- issueType.
- summary.
- template.
- prefix mapping.
- max length.
- lowercase flag.

## Output

Nombre Git válido.

## Reglas

- issueKey obligatorio.
- summary puede estar vacío.
- fallback: `{prefix}/{issueKey}`.
- sin espacios.
- sin `..`.
- sin slash inicial o final.
- sin punto final.
- sin caracteres de control.
- no exceder max length.
- nunca truncar issueKey.
- salida determinista.

## Casos

- Story + summary normal.
- Bug + caracteres especiales.
- Summary vacío.
- Summary extremadamente largo.
- Unicode.
- Guiones consecutivos.
- Issue type sin mapping.
- Template inválida.
