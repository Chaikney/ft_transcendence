#!/bin/bash
set -e

# Remove the server.pid file if it exists to prevent boot errors
rm -f /app/tmp/pids/server.pid

# 1. Wait for the database to be ready
# This prevents the command from failing if the DB container is slower to start
echo "Waiting for the database to be ready..."
until nc -z -v -w30 db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done
echo "Postgres is ready."

# 2. Prepare the database (Create if it doesn't exist + Run migrations)
echo "Preparing the database..."
bundle exec rails db:prepare

# 3. Execute the main container command (the CMD from the Dockerfile)
exec "$@"