# ♟️ Transcendence Real-Time Backend (WebSockets & Game Core)

Este módulo gestiona la lógica de juego en tiempo real y las conexiones WebSocket utilizando **ActionCable** y una **Arquitectura Hexagonal**. El sistema aísla por completo el flujo de red, la orquestación de servicios y el motor interno del juego.

## 🏗️ Arquitectura del Sistema

El flujo de datos sigue un diseño unidireccional desacoplado:
1. **Frontend** envía una acción de movimiento en formato JSON por el WebSocket.
2. **GameChannel** intercepta la conexión, autentica mediante JWT y delega el payload.
3. **GameService** orquesta la acción buscando la partida e invocando al motor.
4. **ChessEngine** procesa los datos (actualmente simulados/mockeados) y devuelve el nuevo estado.
5. **GameService** emite un broadcast con el estado actualizado a todos los clientes suscritos.

**Estructura de Directorios:**
`app/`
`├── channels/`
`│   ├── application_cable/`
`│   │   ├── channel.rb`
`│   │   └── connection.rb      <-- Autenticación JWT por URL`
`│   └── game_channel.rb        <-- Intercepta play_move y gestiona salas`
`├── services/`
`│   └── game_service.rb        <-- Orquesta y dispara el broadcast por ActionCable`
`└── core/`
`    └── chess_engine.rb        <-- Cerebro del juego (Punto de integración C++)`

---

## 🔌 Guía de Pruebas (Testing con Insomnia/Postman)

### 1. Establecer Conexión (Handshake)
Conéctate al servidor mediante la URL de WebSockets pasando el token JWT del usuario verificado como parámetro:
`ws://localhost:3000/cable?token=TU_TOKEN_JWT_AQUÍ`

### 2. Paso A: Suscribirse a una Partida (Sala)
ActionCable requiere una suscripción explícita antes de recibir o enviar datos. Envía este payload JSON para unirse a una partida (ejemplo: ID `7`):

{
  "command": "subscribe",
  "identifier": "{\"channel\":\"GameChannel\",\"game_id\":\"7\"}"
}

*El servidor confirmará la conexión exitosa en los logs de transmisión.*

### 3. Paso B: Realizar un Movimiento
Una vez dentro de la sala, para simular la acción de un jugador moviendo una pieza, envía:

{
  "command": "message",
  "identifier": "{\"channel\":\"GameChannel\",\"game_id\":\"7\"}",
  "data": "{\"action\":\"play_move\",\"from\":\"e2\",\"to\":\"e4\"}"
}

El servidor responderá de vuelta de forma síncrona a todos los clientes conectados con la estructura oficial del contrato de datos.

---

## 🛠️ Integración del Motor C++ (Para el equipo de Engine)

El archivo `app/core/chess_engine.rb` está preparado con datos simulados (*mock*) para no bloquear el desarrollo del Frontend. Cuando el binario compilado de C++ esté listo, la integración se realizará sustituyendo el método `move` por una llamada de sistema (Standard I/O):

* **Formato de entrada esperado por C++:** Argumentos por línea de comandos (`FEN_actual`, `from`, `to`).
* **Formato de salida esperado por Rails:** Un string JSON puro impreso por consola (`std::cout`) que contenga el nuevo FEN, turno y estado.

---

## 🔀 Historial de Cambios Recientes

**Último Commit:** `feat(websockets): implementar ActionCable, JWT auth y simulación del game core`

* Configuración de `ApplicationCable::Connection` para interceptar y validar tokens JWT por URL.
* Creación de `GameChannel` para gestionar suscripciones a salas específicas de partidas.
* Implementación de `GameService` siguiendo arquitectura hexagonal para orquestar los datos entre el canal y el core.
* Creación de `ChessEngine` con datos simulados (mock) y parseo a JSON para desbloquear el desarrollo del Frontend.
* Corrección del autoloader de Zeitwerk reubicando los archivos de channels a la jerarquía correcta.

---

## 🚨 Troubleshooting y Notas para el Equipo (IMPORTANTE)

Al haber aislado el backend en su propia carpeta para mejorar el build de Docker, es posible que os encontréis con un par de errores la primera vez que levantéis el proyecto. Aquí tenéis la solución directa:

### 1. Error: `Database not found`
Al cambiar la ruta del `docker-compose.yml`, Docker genera un volumen nuevo y vacío para PostgreSQL. Vuestra base de datos anterior no se ha borrado, pero Docker ya no la enlaza.
**Solución:** Con los contenedores encendidos, hay que recrear la base de datos y correr las migraciones:
`docker compose exec api bundle exec rails db:create db:migrate db:seed`

### 2. Error: `env: ‘ruby.exe’: No such file or directory`
Si utilizáis Windows con WSL, los ejecutables de la carpeta `bin/` (como `bin/rails`) pueden haberse generado con saltos de línea de Windows, lo que hace que el contenedor de Linux no los entienda.
**Solución:** NUNCA ejecutéis `bin/rails` directamente dentro del contenedor. Usad siempre `bundle exec rails` por delante para forzar el uso del Ruby nativo de Linux (ejemplo: `bundle exec rails console`).
