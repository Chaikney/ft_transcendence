El tercer rol es crítico: el **Especialista en Ajedrez (Motor de Reglas)**. Su código es la lógica del juego. Si su estructura es débil, la IA del siguiente integrante no tendrá sobre qué trabajar.

### 🚀 Orden de Ejecución de Tareas

1. **Representación del Tablero (Data Structure):**
    
    - **Tarea:** Definir cómo se almacena el tablero. Recomiendo **Bitboards** (si busca rendimiento extremo) o una **Matriz 8x8** (si busca legibilidad).
        
    - **Objetivo:** Crear una clase `ChessBoard` que pueda inicializarse desde una cadena **FEN**.
        
    - **Por qué:** Es el formato estándar de ajedrez. Si no usa FEN, no podrá intercambiar datos con nadie.
        
2. **Motor de Movimientos (Move Generator):**
    
    - **Tarea:** Programar la lógica de cada pieza (peón, torre, caballo, alfil, dama, rey).
        
    - **Objetivo:** Método `get_legal_moves(position)`. Debe considerar: jaques, enroques, capturas al paso y promoción.
        
    - **Por qué:** El motor de IA solo llamará a este método para saber qué opciones tiene.
        
3. **Gestión de Estado de Partida:**
    
    - **Tarea:** Lógica de fin de juego (Checkmate, Stalemate, insuficiencia de material).
        
    - **Objetivo:** El sistema debe saber cuándo parar la partida.
        
4. **API Interna (Service Layer):**
    
    - **Tarea:** Crear un método que reciba un movimiento, valide si es legal y aplique el cambio al tablero.
        
    - **Objetivo:** `Board.make_move(move) -> new_board_state`.
        

### 🏗️ Arquitectura de Sincronía (Reglas de Oro)

Para que el ajedrez no se convierta en un monolito inmanejable:

- **Inmutabilidad (Recomendado):** Cada movimiento debería devolver una _nueva instancia_ del tablero en lugar de modificar la actual. Esto facilita que la IA pruebe movimientos hipotéticos sin destruir la posición actual.
    
- **Aislamiento del Core:** Este rol debe trabajar **exclusivamente** en `app/core/chess/`. **Prohibido** usar `ActiveRecord` aquí. Si necesita guardar algo, que lo pase al Controlador (que sí tiene acceso a la BD).
    

### 🛠️ Flujo de Trabajo para Sincronizar con el Equipo

1. **Contrato con la IA:** Debe sentarse con el integrante 4 (IA) para acordar cómo la IA recibirá el tablero. Si el motor usa una estructura compleja, debe proveer un "traductor" a FEN para que la IA lo entienda.
    
2. **Unit Testing (Mandatorio):** Como es un sistema de reglas, debe crear una suite de tests (RSpec) con posiciones famosas (ej: "posición de jaque mate en 1").
    
3. **Documentación de Movimientos:** Debe definir el formato de movimiento (ej: `e2e4` o un objeto `{from: "e2", to: "e4"}`). **Este es el formato que tú (Frontend) recibirás.**

### ⚠️ El "Check" 

La clave aquí es verificar **la validez del movimiento**:

- _¿Tu motor de ajedrez permite al rey moverse a una casilla donde está en jaque?_ Si la respuesta es sí, el motor está mal.
    
- _¿El motor detecta el enroque correctamente según las reglas de la FIDE?_
    

Antes de programar la IA, su motor sea capaz de jugar una partida completa contra sí mismo desde la consola (a ciegas). Si el motor no puede completar una partida sin errores, no está listo para integrarse.