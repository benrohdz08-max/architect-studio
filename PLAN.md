# Architect Studio — Plan de Mejora v1

## Resumen
Mejoras al Architect Studio basadas en feedback de usuario real tras una sesión completa de prueba.
Se organizan en **fases incrementales** para poder probar cada mejora antes de avanzar.

---

## FASE A: Fundamentos (Persistencia + UX Base)
> Sin persistencia no se puede probar nada seriamente. Sin poder borrar diagramas la UX es frustrante.

### A1. Persistencia con localStorage
- Guardar estado completo del store en `localStorage` con Zustand `persist` middleware
- Auto-save en cada cambio de estado
- Botón "Nuevo Proyecto" que limpia el estado (con confirmación)
- Botón "Exportar Proyecto" → JSON descargable
- Botón "Importar Proyecto" ← cargar JSON
- Al abrir la app: detectar sesión previa y ofrecer continuar o empezar de cero
- **[NUEVO]** JSON checkpoint: el AI genera un bloque `json-checkpoint` al final de cada fase con el estado del proyecto, renderizado con botón "Copiar estado"

### A2. Gestión de diagramas (CRUD)
- Botón ✕ para eliminar diagramas individuales de la lista
- Confirmación antes de borrar
- Evitar duplicados: antes de crear diagrama, verificar si ya existe uno con mismo título+fase
- Botón "Regenerar" en cada diagrama (reemplaza en lugar de crear nuevo)

### A3. Tipografía y densidad
- Reducir font-size base del chat (de text-base a text-sm)
- Reducir padding en mensajes del chat
- Reducir tamaño de headers de paneles
- Más espacio útil para contenido en todas las resoluciones

---

## FASE B: Tema Visual (Dark Mode Blueprint)
> Estilo Vercel/Eraser.io con estética blueprint para el canvas de diagramas.

### B1. Theme system
- Paleta nueva inspirada en Vercel: negro puro (#000), grises fríos, acentos azul eléctrico
- Bordes sutiles con `border-white/5` en lugar de gray-700
- Tipografía: Inter para UI, JetBrains Mono para código/diagramas
- Botones con estilo minimal (ghost buttons, bordes sutiles)

### B2. Canvas Blueprint
- Fondo del panel de diagramas con grid de puntos (dot grid) estilo blueprint/canvas
- Color de fondo: `#0a0a12` con dots en `#1a1a2e`
- CSS pattern: `radial-gradient` repetido para los puntos
- Bordes redondeados suaves en los contenedores de diagramas

### B3. Mermaid theme refinado
- Actualizar colores de nodos para que armonicen con el tema blueprint
- Bordes más finos, colores más tenues, texto más legible
- Estilo de líneas/flechas más limpio
- Sombras sutiles (glow) en nodos interactivos

---

## FASE C: Entrevistador Inteligente + Prompt Boost
> El entrevistador debe proponer, no solo preguntar. Opciones clickeables para usuarios que no saben qué responder.

### C1. Sugerencias de respuesta (Quick Replies + Boosters)
- Componente `SuggestionChips` debajo del input del chat
- 2-4 opciones contextuales por fase (ej: "E-commerce", "SaaS B2B", "App móvil")
- Al hacer click se envía como mensaje del usuario
- Las sugerencias cambian según la fase y el contexto de la conversación
- Incluir opción "Sorpréndeme" que genera una sugerencia creativa
- **[NUEVO]** Parsear opciones `[A]`, `[B]`, `[C]` del AI como botones clickeables debajo del mensaje
- **[NUEVO]** Parsear `[Varita de Brainstorming]` y `[Prompt Boost]` como secciones interactivas

### C2. Entrevistador proactivo (Blueprint Architect Mode)
- Modificar system prompt: el AI debe ofrecer patrones estándar cuando detecta indecisión
- Ejemplo: "Para un sistema de aprobaciones, el flujo típico es: Borrador → Revisión → Aprobado/Rechazado. ¿Quieres usar este patrón o tienes algo diferente en mente?"
- Incluir "plantillas" de flujos comunes en el prompt (CRUD, approval workflow, e-commerce, auth)
- El AI sugiere pero siempre pregunta si el usuario quiere personalizar
- **[NUEVO]** Consultoría proactiva: ofrecer "Ruta A (MVP)" vs "Ruta B (Enterprise)" cuando aplique
- **[NUEVO]** IDs de sección `[REQ-001]` en cada artefacto para persistencia y referencia cruzada
- **[NUEVO]** Wireframes Unicode en fases 1-2 para visualizar pantallas tempranas
- **[NUEVO]** Deep Dive con endpoints y payloads JSON de ejemplo en fases 4-5
- **[NUEVO]** Boosters al final: 3 opciones de funcionalidades extra + preguntas A/B/C para decidir siguiente paso
- **[NUEVO]** Restricción Mermaid: solo `graph`, `sequenceDiagram`, `erDiagram`, `stateDiagram-v2` (prohibido sintaxis experimental)

### C3. Prompt boost / Brainstorming
- Botón ✨ "Ideas" junto al input que genera 3 posibles direcciones
- Basado en el contexto actual de la conversación y fase
- Se muestran como cards expandibles con preview

---

## FASE D: Wireframes Unicode (UX Visual)
> Diagramas ASCII/Unicode de interfaces para acompañar la fase de User Journey y UX.

### D1. Generador de wireframes ASCII
- Nuevo tipo de diagrama: `wireframe` (no Mermaid, renderizado como `<pre>` monospace)
- Templates de componentes comunes:
  ```
  ┌─────────────────────────────┐
  │ ☰  App Name        [👤 User]│
  ├─────────────────────────────┤
  │                             │
  │  ┌──────┐  ┌──────┐       │
  │  │Card 1│  │Card 2│       │
  │  └──────┘  └──────┘       │
  │                             │
  │  [Submit Button]            │
  └─────────────────────────────┘
  ```
- El AI genera wireframes durante fases 1-2 para visualizar pantallas
- Sirve para identificar: endpoints necesarios, campos de formulario, navegación

### D2. Wireframe → Diagrama mapping
- Cada wireframe linkea a los endpoints/entidades que necesita
- Click en un campo del wireframe → muestra la entidad/campo relacionado
- Ayuda a validar completitud: ¿cada pantalla tiene sus endpoints?

---

## FASE E: Navegación y Diagramas Mejorados
> Mejor navegación entre diagramas, interrelación visual, más tipos.

### E1. Navegación entre diagramas
- Botones ← → (prev/next) en el panel de diagramas
- Thumbnails de diagramas en el sidebar con preview miniatura
- Indicador de fase en cada thumbnail (color-coded)
- Diagrama activo resaltado en el sidebar

### E2. Validación Mermaid pre-renderizado
- Antes de renderizar, validar sintaxis con `mermaid.parse()`
- Si falla, intentar auto-corregir errores comunes:
  - Caracteres especiales no escapados
  - Paréntesis/corchetes sin cerrar
  - Keywords incompatibles con versión de Mermaid
- Mostrar error descriptivo con sugerencia de corrección
- Fallback: mostrar el código con syntax highlighting
- **[NUEVO]** Restricción en prompt: solo tipos `graph`, `sequenceDiagram`, `erDiagram`, `stateDiagram-v2` para evitar errores

### E3. Zoom y Pan
- Contenedor de diagrama con zoom (scroll wheel) y pan (drag)
- Botones +/- y "Fit to screen"
- Minimap opcional para diagramas grandes

### E4. Mapa de relaciones entre diagramas
- Vista "mapa" que muestra todos los diagramas como nodos conectados
- Líneas entre diagramas que comparten entidades/estados/endpoints
- Click en conexión → muestra qué elementos comparten
- Vista bird's-eye del proyecto completo
- **[NUEVO]** IDs inter-diagrama: cada diagrama tiene un ID (ej: `[ID-001]`) y el AI referencia "conecta con ID-002" - parseable para navegación

---

## FASE F: Datos de Prueba (Demo Mode)
> Entrevista completa precargada para demostrar capacidades sin tener que construir desde cero.

### F1. Demo project precargado
- Proyecto de ejemplo completo: "Sistema de Gestión de Solicitudes de Vacaciones"
- Incluye:
  - Conversación completa de las 5 fases (15-20 mensajes)
  - 8-10 diagramas generados (flowchart, ER, sequence, state, wireframes)
  - ProjectData completamente poblado
  - Todos los campos: actors, painPoints, entities, endpoints, states
- Botón "Cargar Demo" en la pantalla inicial
- Los datos vienen de un archivo `demoData.ts` estático

### F2. Datos basados en la conversación actual
- Usar la conversación real de esta sesión como base para el demo
- Adaptar los mensajes para que fluyan naturalmente por las 5 fases
- Incluir diagramas que demuestren cada tipo soportado

---

## Orden de implementación sugerido

```
A1 (persistencia) ──→ A2 (CRUD diagramas) ──→ A3 (tipografía)
       │
       ▼
B1 (theme) ──→ B2 (blueprint canvas) ──→ B3 (mermaid theme)
       │
       ▼
C1 (quick replies) ──→ C2 (AI proactivo) ──→ C3 (prompt boost)
       │
       ▼
D1 (wireframes) ──→ D2 (wireframe mapping)
       │
       ▼
E1 (navegación) ──→ E2 (validación) ──→ E3 (zoom) ──→ E4 (mapa relaciones)
       │
       ▼
F1 (demo data) ──→ F2 (datos conversación)
```

## Notas técnicas
- **No se agregan dependencias nuevas** salvo que sea estrictamente necesario
- Zustand `persist` ya viene incluido en zustand, no requiere instalación
- Los wireframes Unicode se renderizan como `<pre>`, sin librería extra
- El zoom/pan puede implementarse con CSS transforms + event listeners
- La validación Mermaid usa `mermaid.parse()` que ya está disponible
