#!/bin/bash
set -e

# Borrar el archivo server.pid si existe
rm -f /app/tmp/pids/server.pid

# Ejecutar el comando principal del contenedor (el CMD del Dockerfile)
exec "$@"