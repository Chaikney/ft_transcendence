#!/bin/sh
set -e

# 1. Limpiamos cualquier rastro de un .env.local anterior.
# Si el archivo ya existe, Vite podría leer una configuración vieja.
rm -f .env.local

exec npm run dev -- --host 0.0.0.0