# Architect Studio - Evaluacion Completa

## Estado actual: 2,270 lineas de codigo fuente

| Metrica | Estado |
|---------|--------|
| Componentes React | 9 |
| Servicios | 2 (aiService, mermaidGenerator) |
| Store (Zustand) | 1 (265 lineas, 17 acciones) |
| Tipos TypeScript | 15 interfaces/types |
| Dependencias prod | 5 (react, react-dom, mermaid, zustand, uuid) |
| PLAN.md completado | ~15% |

---

## 1. ISSUES CRITICOS (Arreglar inmediatamente)

### SEC-001: XSS en ChatPanel.tsx (linea 119)
```
dangerouslySetInnerHTML={{ __html: formatted }}
```
El regex de bold (`**text**`) no escapa HTML entities del input del usuario. Un mensaje con `<script>` o `<img onerror>` ejecutaria codigo arbitrario.

**Fix**: Escapar HTML antes de aplicar el regex de bold.

### SEC-002: Memory leak en MermaidRenderer.tsx (lineas 68-88)
Event listeners se agregan al SVG en cada render pero nunca se limpian con `removeEventListener`. Causa acumulacion de listeners y memoria creciente.

**Fix**: Retornar cleanup function en useEffect.

### SEC-003: Sin Error Boundaries
Si MermaidRenderer, ChatPanel o DiagramPanel lanzan error, toda la app crashea sin recovery.

**Fix**: Agregar React Error Boundary wrapper.

### SEC-004: Modal sin focus trap (SettingsModal.tsx)
El modal no atrapa el foco — los usuarios pueden tabular fuera del modal a elementos del fondo.

**Fix**: Agregar focus trap basico con keydown listener.

---

## 2. ISSUES DE RENDIMIENTO

### PERF-001: formatMessage sin memoizacion (ChatPanel.tsx)
`formatMessage()` se recalcula en cada render aunque el contenido del mensaje no cambie. Con conversaciones largas esto degrada performance.

### PERF-002: typeIcons recreado en cada render (DiagramPanel.tsx:79-87)
Objeto constante dentro del componente se recrea innecesariamente.

### PERF-003: Sin selectores optimizados en Zustand
Todos los componentes usan destructuring directo del store, causando re-renders innecesarios cuando cambia cualquier parte del estado.

### PERF-004: Line numbers recalculados (CodePanel.tsx:73-78)
Se recalculan en cada render — deberia usar CSS counters o memoizar.

---

## 3. ISSUES DE ACCESIBILIDAD

| Componente | Issue | Severidad |
|------------|-------|-----------|
| PhaseProgressBar | Botones sin `aria-label` | Alta |
| PhaseTips | Sin `aria-expanded` en expandable | Media |
| BreadcrumbNav | Sin `aria-current="page"` | Media |
| MermaidRenderer | SVG sin alt text, nodos clickeables sin `role="button"` | Alta |
| ChatPanel | Container sin `role="log"` ni `aria-live="polite"` | Alta |
| SettingsModal | Sin `role="dialog"`, sin `aria-modal` | Alta |
| CodePanel | Botones sin `aria-label` | Media |

---

## 4. ISSUES DE ARQUITECTURA

### ARCH-001: buildContextForAI() es no-op
`aiService.ts:159-165` — La funcion ignora los parametros `messages` y `projectData`. Siempre retorna el mismo SYSTEM_PROMPT. El contexto de la conversacion no se usa para enriquecer las respuestas.

### ARCH-002: generateLocalResponse no usa projectData
`aiService.ts:227-246` — Solo cicla respuestas pre-escritas. No incorpora datos del proyecto.

### ARCH-003: Diagram type detection incorrecta
Todos los diagramas extraidos de AI se etiquetan como 'flowchart' independientemente del contenido real.

### ARCH-004: Sin persistencia de datos
No hay localStorage, no hay auto-save, no hay export/import. Todo se pierde al recargar.

### ARCH-005: Mobile panel desync
`App.tsx:70-82` — Estado local `mobilePanel` puede desinc con `activePanel` del store.

---

## 5. ISSUES DE CODIGO

### CODE-001: Duplicacion en sendUserMessage
`useProjectStore.ts:134-150` — Pattern de creacion de mensaje duplicado para rutas gemini/local.

### CODE-002: advancePhase sin validacion
`useProjectStore.ts:95-110` — Permite avanzar sin contenido en la fase actual.

### CODE-003: initializePhase puede crear duplicados
`useProjectStore.ts:259-263` — Si se llama multiples veces, genera mensajes iniciales duplicados.

### CODE-004: classDiagram definido pero no integrado
`types/index.ts` — DiagramType incluye 'classDiagram' pero no hay generador para el.

### CODE-005: CSS scrollbar solo Webkit
`index.css:4-6` — Firefox users obtienen scrollbar default.

---

## 6. SCORING POR AREA

| Area | Score | Notas |
|------|-------|-------|
| Estructura de proyecto | 8/10 | Bien organizado, separacion clara |
| Tipado TypeScript | 6/10 | Tipos definidos pero incompletos |
| Seguridad | 3/10 | XSS, sin sanitizacion, sin validacion |
| Accesibilidad | 2/10 | Falta casi todo |
| Performance | 5/10 | Funcional pero sin optimizaciones |
| UX | 6/10 | Buena base, falta polish |
| Persistencia | 0/10 | Inexistente |
| Error handling | 3/10 | Basico, sin boundaries |
| AI Integration | 5/10 | Funcional pero contexto no se usa |
| Diagrams | 7/10 | Buena generacion, falta CRUD |
| **TOTAL** | **45/100** | **MVP funcional con gaps criticos** |
