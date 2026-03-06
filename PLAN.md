# Architect Studio — Plan de Implementacion MVP

## Estado actual
- Score: 45/100 (ver EVALUATION.md)
- Roadmap estrategico: MVP-ROADMAP.md
- Sprint 0 (fixes criticos): COMPLETADO

---

## SPRINT 1: Data Extraction — El Corazon del MVP
> Sin extraccion de datos, los diagramas son genericos y la app no tiene valor.

### 1.1 System prompt con json-extract
- Modificar SYSTEM_PROMPT para que el AI SIEMPRE incluya un bloque oculto:
  ```
  \`\`\`json-extract
  {"actors": [...], "painPoints": [...], "objectives": [...]}
  \`\`\`
  ```
- Bloque diferente por fase:
  - Fase 1: actors, painPoints, objectives, projectName
  - Fase 2: journeySteps (name, actor, order)
  - Fase 3: states (name, transitions, triggers)
  - Fase 4: entities (name, fields, relations)
  - Fase 5: endpoints (method, path, payload, entity)

### 1.2 Parseo de json-extract en store
- En `sendUserMessage()`, despues de recibir respuesta del AI:
  1. Extraer bloques `json-extract` del response
  2. Parsear JSON
  3. Llamar `updateProjectData()` con datos extraidos
  4. Remover bloque `json-extract` del texto visible en chat
- Manejar errores de parseo sin romper el flujo

### 1.3 buildContextForAI dinamico
- Reescribir `buildContextForAI()` para incluir:
  - SYSTEM_PROMPT base
  - Datos acumulados del proyecto (actores, entidades, etc.)
  - Fase actual y lo que se espera extraer
  - Instrucciones de formato json-extract para la fase

### 1.4 Diagramas reactivos a datos reales
- Verificar que `generateDiagramForPhase()` usa projectData correctamente
- Los generadores ya manejan datos vacios con defaults
- Al extraer datos, regenerar diagrama de fase automaticamente
- Agregar indicador visual: "Diagrama actualizado con tus datos"

---

## SPRINT 2: Persistencia + Export
> El usuario necesita guardar trabajo y llevarse el resultado.

### 2.1 Zustand persist middleware
- Agregar `persist` con `localStorage`
- Keys a persistir: messages, diagrams, projectData, currentPhase, phaseCompleted, aiMode, geminiApiKey
- Al abrir app con datos guardados: modal "Continuar proyecto o empezar nuevo?"

### 2.2 Export proyecto
- Boton "Exportar JSON": descarga estado completo del store
- Boton "Exportar Markdown": documento de arquitectura legible:
  ```markdown
  # Arquitectura: [nombre del proyecto]
  ## Actores
  ## Pain Points
  ## User Journey
  ## Modelo de Datos (diagrama ER)
  ## Endpoints API
  ```
- Este es el OUTPUT REAL del MVP

### 2.3 Import proyecto
- Boton "Importar": cargar JSON exportado
- Validar estructura antes de importar
- Confirmar si hay proyecto actual en curso

### 2.4 Nuevo proyecto
- Boton "Nuevo Proyecto" con confirmacion
- Limpia store + localStorage
- Reinicia en Fase 1

---

## SPRINT 3: Modo Local Util + Validaciones
> El modo local debe dar valor real sin API key.

### 3.1 Pantalla de bienvenida con templates
- Al iniciar sin proyecto: mostrar selector de tipo de app
- Templates: E-commerce, SaaS B2B, App movil, Sistema interno, Libre
- Cada template pre-llena projectData con datos tipicos del dominio
- Esto da valor INMEDIATO al modo local

### 3.2 Validacion de avance de fase
- No permitir avanzar sin al menos 1 mensaje del usuario
- Mostrar resumen antes de avanzar: "Definiste X actores, Y pain points"
- Confirmar transicion

### 3.3 CRUD de diagramas
- Eliminar diagramas (con confirmacion)
- Regenerar diagrama con datos actuales
- Evitar duplicados (verificar titulo+fase)

### 3.4 Validacion Mermaid
- `mermaid.parse()` antes de renderizar
- Auto-correccion de errores comunes
- Error descriptivo + fallback con codigo visible

---

## SPRINT 4: UX Polish
> Solo despues de que el core funcione.

### 4.1 Tema visual
- Blueprint canvas (dot grid) en panel de diagramas
- Tipografia Inter + JetBrains Mono
- Paleta refinada tipo Vercel

### 4.2 Suggestion chips
- Opciones contextuales debajo del input
- Parseo de [A], [B], [C] como botones (YA IMPLEMENTADO)
- Sugerencias por fase

### 4.3 Navegacion de diagramas
- Prev/next en panel de diagramas
- Thumbnails en sidebar
- Indicador de fase color-coded

### 4.4 Demo project
- Proyecto precargado completo
- Boton "Ver Demo" en pantalla de bienvenida

---

## Criterios de MVP Listo

- [ ] Usuario describe idea → diagramas reflejan SU idea (no genericos)
- [ ] 5 fases con preguntas relevantes al contexto
- [ ] Datos se extraen y acumulan automaticamente
- [ ] Guardar y continuar otro dia (localStorage)
- [ ] Exportar documento de arquitectura (Markdown)
- [ ] Funcionar sin API key (templates)
- [ ] Editar diagramas manualmente

## Orden

```
Sprint 0 [COMPLETADO] — Fixes criticos
    |
Sprint 1 [SIGUIENTE]  — Data extraction (el core)
    |
Sprint 2              — Persistencia + export
    |
Sprint 3              — Modo local + validaciones
    |
Sprint 4              — UX polish
```
