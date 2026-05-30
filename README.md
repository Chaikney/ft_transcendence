# ♟️ Transcendence Real-Time Backend (WebSockets & Game Core)

Este módulo gestiona la lógica de juego en tiempo real y las conexiones WebSocket utilizando **ActionCable** y una **Arquitectura Hexagonal**. El sistema aísla por completo el flujo de red, la orquestación de servicios y el motor interno del juego.

## 🏗️ Arquitectura del Sistema

El flujo de datos sigue un diseño unidireccional desacoplado:
1. **Frontend** envía una acción de movimiento en formato JSON por el WebSocket.
2. **GameChannel** intercepta la conexión, autentica mediante JWT y delega el payload.
3. **GameService** orquesta la acción buscando la partida e invocando al motor.
4. **ChessEngine** procesas los datos (actualmente simulados/mockeados) y devuelve el nuevo estado.
5. **GameService** emite un broadcast con el estado actualizado a todos los clientes suscritos.

```text
app/
├── channels/
│   ├── application_cable/
│   │   ├── channel.rb
│   │   └── connection.rb      <-- Autenticación JWT por URL
│   └── game_channel.rb        <-- Intercepta play_move y gestiona salas
├── services/
│   └── game_service.rb        <-- Orquesta y dispara el broadcast por ActionCable
└── core/
    └── chess_engine.rb        <-- Cerebro del juego (Punto de integración C++)