### 5. Arquitecto & Frontend Lead: El "Orquestador de la Experiencia"

Tu objetivo no es solo pintar botones, sino asegurar que el **Frontend (React)** y el **Backend (Rails/Core)** mantengan una coherencia perfecta. Al estar todo en Ruby, tu mayor riesgo es la **degradación de la arquitectura** (que todo se mezcle en un caos).

#### 🚀 Orden de Ejecución de Tareas

1. **Contract-First Development:**
    
    - **Tarea:** Definir las interfaces de TypeScript basándote en los modelos de Rails.
        
    - **Objetivo:** Que el Frontend y el Backend hablen el mismo lenguaje desde el minuto uno.
        
    - **Por qué:** Si el Backend cambia el modelo de `Game` (ej: añade `winner_id`), el Frontend debe "romperse" al compilar, no en producción.
        
2. **Sistema de Estado Global (Zustand/Redux):**
    
    - **Tarea:** Crear el store que gestione la "partida activa" (Ajedrez o Sudoku).
        
    - **Objetivo:** Que los componentes de UI no tengan lógica, solo consuman el estado global.
        
    - **Por qué:** Evitas desincronizaciones entre lo que el servidor tiene y lo que el usuario ve.
        
3. **Integración de WebSockets (ActionCable):**
    
    - **Tarea:** Configurar la conexión en tiempo real para partidas multijugador.
        
    - **Objetivo:** Actualizar el tablero al instante sin refrescar la página.
        
    - **Por qué:** Es la base de la experiencia competitiva en 42.
        
4. **Componentización Genérica:**
    
    - **Tarea:** Crear componentes de tablero que reciban los datos (JSON) independientemente de si es Sudoku o Ajedrez.
        
    - **Objetivo:** Reutilizar componentes para que el diseño sea consistente en toda la plataforma.
        

### 🏗️ Arquitectura de Sincronía (Reglas de Oro Actualizadas)

- **SPA + API Only:** El Frontend debe ser una Single Page Application pura que solo consume JSON. **Prohibido** que el Frontend renderice vistas de Rails (`.html.erb`). Todo pasa por la API de Rails.
    
- **Capa de Servicios en Rails:** Debes asegurarte de que el Backend no ponga lógica de juego en los controladores. Toda la lógica debe estar en `app/core/`, y los controladores solo llaman a esos servicios.
    
- **Validación de tipos:** Usa `Prop-Types` o `TypeScript Interfaces` en cada componente de React. Si no hay tipo, no hay merge.
    

### 🛠️ Flujo de Trabajo para Sincronizar con el Equipo

1. **API Contract Review:** Tú debes revisar cada PR del equipo. Si alguien cambia la estructura de una respuesta JSON, es tu responsabilidad actualizar el contrato de la API y notificar al equipo.
    
2. **Mocks vs. Implementación:** Para no bloquearte, usa datos mockeados al principio. Una vez que el Backend termine su hito, simplemente conectas la URL de producción.
    
3. **Documentación Centralizada:** Debes mantener un archivo `API_SPEC.md` en la raíz del repo donde todos consulten qué devuelve cada endpoint.
    

### ⚠️ El "Check" de Arquitecto (Auto-Auditoría)

- **¿Estoy usando el mismo endpoint para distintos juegos?** (Error común: no centralizar la lógica).
    
- **¿Es mi estado de React un reflejo directo del estado en la BD de Rails?** Si hay diferencia, tu lógica de sincronización está fallando.
    
- **¿He permitido lógica de juego en el Frontend?** _Regla estricta:_ El Frontend **solo** pinta el tablero. Quién gana, quién puede mover y si el movimiento es legal, **siempre** lo decide el Backend. Nunca confíes en el Frontend para validar las reglas del ajedrez.