# Architect Studio — MVP Roadmap (Expert Edition)

## La Verdad del Prototipo

### Que funciona
- UI layout 3 paneles (chat, diagrama, codigo)
- Mermaid rendering correcto
- Sistema de 5 fases con progresion visual
- Integracion Gemini con system prompt rico
- Breadcrumb navigation para sub-diagramas
- Error boundaries y fixes de seguridad (Sprint 0 completo)

### Que esta ROTO (bloquea el MVP)
1. `projectData` nunca se llena — el chat no extrae datos estructurados
2. Los diagramas son genericos (siempre los mismos defaults)
3. Modo local es un cuestionario pre-escrito que ignora respuestas
4. Cero persistencia (refresh = todo perdido)
5. Sin output exportable (no se puede sacar nada de la app)
6. `buildContextForAI()` es no-op (ignora mensajes y datos del proyecto)
7. No hay validacion de fase (puedes saltar 5 fases en 5 clicks vacios)

### Lo que NO importa para el MVP
- Blueprint canvas / dot grid
- Zoom y pan
- Wireframes Unicode
- Tema Vercel
- Demo data precargado
- Mapa de relaciones entre diagramas

---

## FASE 0: DATA EXTRACTION (El Corazon del MVP)
> Sin esto no hay producto. Todo lo demas es decoracion.
> **Prioridad: CRITICA**

### 0.1 Extraccion de datos del chat con AI
El problema central: el usuario habla y la app no entiende.

**Solucion**: Usar el AI (Gemini) para extraer datos estructurados de cada respuesta.

Cuando el usuario responde en Fase 1:
- AI responde normalmente (pregunta socratica)
- ADEMAS, AI genera un bloque `json-extract` oculto con datos estructurados:
  ```json
  {"actors": ["Admin", "Empleado"], "painPoints": ["Proceso manual lento"]}
  ```
- El store parsea este bloque y actualiza `projectData`
- Los diagramas se regeneran con datos REALES

**Implementacion**:
- Modificar system prompt: pedir que SIEMPRE incluya `json-extract` al final
- Modificar `sendUserMessage()`: parsear `json-extract` de la respuesta
- Llamar `updateProjectData()` con datos extraidos
- Regenerar diagrama de la fase actual automaticamente

### 0.2 Diagramas personalizados (no genericos)
Actualmente `generateDiagramForPhase()` usa defaults hardcoded cuando `projectData` esta vacio.

**Solucion**: Ahora que 0.1 llena `projectData`, los diagramas reflejan la conversacion real.

- Fase 1: Diagrama de contexto con actores REALES del usuario
- Fase 2: Journey con pasos REALES descritos en la conversacion
- Fase 3: Estados REALES del flujo que el usuario describio
- Fase 4: Entidades REALES extraidas de la conversacion
- Fase 5: Endpoints REALES basados en las entidades

### 0.3 buildContextForAI funcional
`buildContextForAI()` debe construir contexto dinamico:

```typescript
function buildContextForAI(messages, projectData, currentPhase) {
  return `${SYSTEM_PROMPT}

DATOS DEL PROYECTO HASTA AHORA:
- Actores: ${projectData.actors.join(', ') || 'No definidos'}
- Pain Points: ${projectData.painPoints.join(', ') || 'No definidos'}
- Entidades: ${projectData.entities.map(e => e.name).join(', ') || 'No definidas'}
- Fase actual: ${currentPhase}

Usa estos datos para hacer preguntas mas especificas y generar diagramas relevantes.`;
}
```

---

## FASE 1: PERSISTENCIA + OUTPUT
> El usuario necesita poder guardar su trabajo y llevarselo.
> **Prioridad: ALTA**

### 1.1 localStorage con Zustand persist
- Agregar middleware `persist` al store
- Auto-save en cada cambio
- Al abrir: "Tienes un proyecto guardado. Continuar o empezar nuevo?"

### 1.2 Export del proyecto
- Boton "Exportar JSON" — descarga el estado completo
- Boton "Exportar Markdown" — documento legible con:
  - Resumen del proyecto
  - Actores y pain points
  - User journey
  - Diagrama ER
  - Endpoints con payloads de ejemplo
- Este es el OUTPUT REAL del MVP: un documento de arquitectura generado

### 1.3 Import proyecto
- Cargar JSON exportado anteriormente
- Validar schema antes de importar

---

## FASE 2: MODO LOCAL INTELIGENTE (Sin API)
> El modo local actual es inutil. Para MVP necesita valor real.
> **Prioridad: ALTA**

### 2.1 Templates estructurados por tipo de app
En vez de preguntas genericas, ofrecer templates:

**Pantalla inicial**:
"Que tipo de aplicacion quieres disenar?"
- [A] E-commerce (tienda online)
- [B] SaaS B2B (plataforma de gestion)
- [C] App movil (consumidor final)
- [D] Sistema interno (workflows/aprobaciones)
- [E] Describir libremente

Cada template pre-llena `projectData` con:
- Actores tipicos del dominio
- Entidades comunes
- Flujos estandar
- Endpoints base

### 2.2 Flujo guiado sin AI
Si no hay API key, el modo local se convierte en un wizard:
- Formularios estructurados por fase (no chat libre)
- Fase 1: Inputs para nombre, descripcion, actores, pain points
- Fase 2: Drag-and-drop de pasos del journey
- Fase 3: Selector de estados y transiciones
- Fase 4: Builder de entidades con campos y relaciones
- Fase 5: Auto-generacion de endpoints basados en entidades

Esto da valor REAL sin depender de un API externo.

---

## FASE 3: CRUD DE DIAGRAMAS + VALIDACION
> Poder gestionar y corregir diagramas.
> **Prioridad: MEDIA**

### 3.1 CRUD de diagramas
- Eliminar diagramas (con confirmacion)
- Renombrar diagramas
- Regenerar diagrama (con datos actuales de projectData)
- Evitar duplicados

### 3.2 Validacion Mermaid
- `mermaid.parse()` antes de renderizar
- Auto-correccion de errores comunes
- Mensajes de error descriptivos
- Fallback con codigo visible

### 3.3 Validacion de fase
- No permitir avanzar de fase sin al menos 1 respuesta del usuario
- Mostrar indicador de "completitud" de fase
- Confirmacion antes de avanzar: "Has definido X actores y Y pain points. Quieres continuar?"

---

## FASE 4: UX POLISH
> Solo DESPUES de que el core funcione.
> **Prioridad: BAJA**

### 4.1 Tema visual mejorado
- Blueprint canvas en panel de diagramas
- Tipografia Inter/JetBrains Mono
- Paleta refinada

### 4.2 Navegacion entre diagramas
- Prev/next
- Thumbnails
- Zoom/pan basico

### 4.3 Demo project
- Proyecto precargado para mostrar capacidades
- Recorrido guiado

---

## Orden de implementacion

```
FASE 0 (data extraction)    ← SIN ESTO NO HAY PRODUCTO
    |
    v
FASE 1 (persistencia + output) ← SIN ESTO NO HAY MVP
    |
    v
FASE 2 (modo local util)    ← NECESARIO PARA FUNCIONAR SIN API
    |
    v
FASE 3 (CRUD + validacion)  ← POLISH DEL CORE
    |
    v
FASE 4 (UX polish)          ← NICE TO HAVE
```

## Criterios de MVP "Listo"

El MVP esta listo cuando un usuario puede:

1. [ ] Abrir la app y describir su idea en chat
2. [ ] Ver diagramas que REFLEJAN su idea (no genericos)
3. [ ] Recorrer las 5 fases con preguntas relevantes
4. [ ] Ver como su proyecto se enriquece en cada fase
5. [ ] Editar diagramas manualmente si quiere
6. [ ] Guardar su trabajo (persistencia)
7. [ ] Exportar un documento de arquitectura (Markdown/JSON)
8. [ ] Volver otro dia y continuar donde lo dejo
9. [ ] Funcionar sin API key (modo local con templates)

## Metricas de exito

| Metrica | Objetivo MVP |
|---------|-------------|
| Tiempo idea → primer diagrama personalizado | < 3 min |
| Tiempo recorrido completo (5 fases) | < 20 min |
| Datos extraidos correctamente | > 80% |
| Diagrams que reflejan la conversacion | 100% |
| Export usable como documento | Si |

## Archivos clave a modificar

| Archivo | Cambio principal |
|---------|-----------------|
| `aiService.ts` | json-extract en prompt, buildContextForAI funcional |
| `useProjectStore.ts` | Parseo de json-extract, persist middleware, export |
| `mermaidGenerator.ts` | Ya funciona si projectData tiene datos |
| `ChatPanel.tsx` | Ocultar json-extract del chat, mostrar indicador de datos extraidos |
| `phaseConfig.ts` | Templates por tipo de app |
| `App.tsx` | Pantalla de bienvenida con seleccion de template/import |

## Lo que NO haremos en el MVP

- Wireframes Unicode (complejidad alta, valor bajo)
- Mapa de relaciones entre diagramas (feature avanzada)
- Multiples proyectos simultaneos (v2)
- Colaboracion en tiempo real (v2)
- Integracion con GitHub/GitLab (v2)
- Generacion de codigo (v2)
- Zoom/pan avanzado (v2)
