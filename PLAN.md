# Architect Studio — Plan de Mejora v2

## Resumen
Plan priorizado basado en evaluacion completa del codebase (ver EVALUATION.md).
Score actual: **45/100**. Objetivo: **80/100** tras completar Sprints 0-3.

---

## SPRINT 0: Fixes Criticos (Seguridad + Estabilidad)
> Estos fixes son bloqueantes. Sin ellos la app tiene vulnerabilidades activas.
> **Estimado: 1 sesion**

### S0-1. Fix XSS en ChatPanel.tsx [SEC-001]
- Escapar HTML entities ANTES de aplicar regex de bold
- Crear helper `escapeHtml()` que escape `<`, `>`, `&`, `"`, `'`
- Aplicar a todo contenido renderizado con `dangerouslySetInnerHTML`

### S0-2. Fix memory leak en MermaidRenderer.tsx [SEC-002]
- Retornar cleanup function en `useEffect` que remueva event listeners
- Guardar referencias a los listeners para poder limpiarlos

### S0-3. Error Boundary [SEC-003]
- Crear componente `ErrorBoundary.tsx` generico
- Wrappear MermaidRenderer, ChatPanel y DiagramPanel
- Mostrar fallback con boton "Reintentar"

### S0-4. Fix SettingsModal accesibilidad [SEC-004]
- Agregar `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap basico con keydown listener
- Cerrar con Escape key

### S0-5. Fix diagram type detection [ARCH-003]
- Parsear contenido mermaid para detectar tipo real (graph, erDiagram, etc.)
- Actualizar `extractMermaidDiagrams()` en aiService.ts

---

## SPRINT 1: Persistencia + CRUD (Fase A)
> Fundamento para todas las demas features.
> **Estimado: 1-2 sesiones**

### S1-1. Persistencia con localStorage [A1]
- Agregar Zustand `persist` middleware al store
- Auto-save en cada cambio de estado
- Al abrir: detectar sesion previa, ofrecer continuar o empezar de cero
- JSON checkpoint: el AI genera bloque `json-checkpoint` al cierre de fase (ya en system prompt)

### S1-2. Proyecto: Nuevo / Exportar / Importar [A1]
- Boton "Nuevo Proyecto" con confirmacion (limpia store + localStorage)
- Boton "Exportar" → descarga JSON del estado completo
- Boton "Importar" → carga JSON y rehydrata store
- Agregar estos botones al Header o SettingsModal

### S1-3. Gestion de diagramas CRUD [A2]
- Boton X para eliminar diagramas (con confirmacion)
- Evitar duplicados: verificar titulo+fase antes de crear
- Boton "Regenerar" en cada diagrama (reemplaza en vez de crear nuevo)

### S1-4. Tipografia y densidad [A3]
- Chat: text-sm, padding reducido en mensajes
- Headers de paneles mas compactos
- Mas espacio util en todas las resoluciones

---

## SPRINT 2: Tema Visual + Blueprint (Fase B)
> Estetica profesional tipo Vercel/Eraser.io
> **Estimado: 1 sesion**

### S2-1. Theme system [B1]
- Paleta Vercel: negro puro (#000), grises frios, acentos azul electrico
- Bordes sutiles con `border-white/5`
- Tipografia: Inter para UI, JetBrains Mono para codigo
- Ghost buttons con bordes sutiles

### S2-2. Canvas Blueprint [B2]
- Fondo del panel de diagramas con dot grid blueprint
- `#0a0a12` con dots en `#1a1a2e` (radial-gradient)
- Bordes redondeados suaves en contenedores

### S2-3. Mermaid theme refinado [B3]
- Colores de nodos armonizados con tema blueprint
- Bordes finos, colores tenues, texto legible
- Glow sutil en nodos interactivos

---

## SPRINT 3: AI Inteligente + Interaccion (Fase C)
> El entrevistador propone, no solo pregunta.
> **Estimado: 1-2 sesiones**

### S3-1. Sugerencias de respuesta + Boosters [C1]
- Componente `SuggestionChips` debajo del input del chat
- 2-4 opciones contextuales por fase (estaticas por ahora)
- Parseo de [A], [B], [C] como botones clickeables (YA IMPLEMENTADO)
- Opcion "Sorprendeme"

### S3-2. buildContextForAI funcional [ARCH-001/002]
- Hacer que `buildContextForAI()` use messages y projectData realmente
- Incluir resumen de datos acumulados en el contexto del AI
- Mejorar `generateLocalResponse()` para usar projectData

### S3-3. Prompt boost / Brainstorming [C3]
- Boton "Ideas" junto al input
- Genera 3 posibles direcciones basadas en contexto
- Cards expandibles con preview

---

## SPRINT 4: Wireframes + Navegacion (Fases D-E)
> UX visual y navegacion avanzada entre diagramas.
> **Estimado: 2 sesiones**

### S4-1. Wireframes Unicode [D1]
- Nuevo tipo de diagrama: `wireframe` (renderizado como `<pre>` monospace)
- Templates de componentes comunes (nav, cards, forms, tables)
- AI genera wireframes en fases 1-2

### S4-2. Navegacion entre diagramas [E1]
- Botones prev/next en panel de diagramas
- Thumbnails con preview miniatura en sidebar
- Indicador de fase color-coded
- Diagrama activo resaltado

### S4-3. Validacion Mermaid pre-renderizado [E2]
- Validar con `mermaid.parse()` antes de renderizar
- Auto-correccion de errores comunes
- Fallback: mostrar codigo con syntax highlighting
- Restriccion de tipos ya en prompt (IMPLEMENTADO)

### S4-4. Zoom y Pan [E3]
- CSS transforms + event listeners (sin dependencias)
- Botones +/- y "Fit to screen"
- Scroll wheel zoom, drag pan

---

## SPRINT 5: Demo + Polish (Fase F)
> Datos de prueba y pulido final.
> **Estimado: 1 sesion**

### S5-1. Demo project precargado [F1]
- Archivo `demoData.ts` con proyecto completo
- Conversacion de 5 fases (15-20 mensajes)
- 8-10 diagramas de todos los tipos
- Boton "Cargar Demo" en pantalla inicial

### S5-2. Accesibilidad completa
- `aria-label` en todos los botones interactivos
- `role="log"` y `aria-live="polite"` en chat
- `aria-expanded` en expandables
- Focus visible en todos los interactivos

### S5-3. Performance optimizations
- `React.memo` en componentes de renderizado frecuente
- Selectores optimizados de Zustand
- Memoizacion de formatMessage

### S5-4. Mapa de relaciones [E4]
- Vista bird's-eye de todos los diagramas como nodos conectados
- IDs inter-diagrama para navegacion cruzada

---

## Orden de implementacion

```
SPRINT 0 (criticos) ──→ SPRINT 1 (persistencia) ──→ SPRINT 2 (tema)
                                                          │
                                                          ▼
                              SPRINT 3 (AI) ──→ SPRINT 4 (wireframes/nav)
                                                          │
                                                          ▼
                                                    SPRINT 5 (demo/polish)
```

## Impacto estimado en score

| Sprint | Score antes | Score despues | Delta |
|--------|------------|--------------|-------|
| Sprint 0 | 45 | 55 | +10 |
| Sprint 1 | 55 | 65 | +10 |
| Sprint 2 | 65 | 72 | +7 |
| Sprint 3 | 72 | 80 | +8 |
| Sprint 4 | 80 | 88 | +8 |
| Sprint 5 | 88 | 95 | +7 |

## Notas tecnicas
- **No se agregan dependencias nuevas** salvo que sea estrictamente necesario
- Zustand `persist` ya viene incluido en zustand, no requiere instalacion
- Los wireframes Unicode se renderizan como `<pre>`, sin libreria extra
- El zoom/pan se implementa con CSS transforms + event listeners
- La validacion Mermaid usa `mermaid.parse()` que ya esta disponible
- Error Boundary es un componente React puro, sin dependencias
