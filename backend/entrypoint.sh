#!/bin/bash
set -e

# Borrar el archivo server.pid si existe (para evitar errores de arranque)
rm -f /app/tmp/pids/server.pid

# 1. Esperar a que la base de datos esté lista
# Esto evita que el comando falle si el contenedor de la BD es más lento al arrancar
echo "Esperando a que la base de datos esté lista..."
until nc -z -v -w30 db 5432; do
  echo "Esperando a Postgres..."
  sleep 1
done
echo "Postgres está listo."

# 2. Ejecutar las migraciones automáticamente
echo "Ejecutando migraciones de base de datos..."
bundle exec rails db:migrate

# 3. Ejecutar el comando principal del contenedor (el CMD del Dockerfile)
exec "$@"