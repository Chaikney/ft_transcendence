# Usamos una versión específica y estable
FROM ruby:3.3-slim AS base 

# Instalamos dependencias necesarias:
# - build-essential: para compilar gemas con extensiones C
# - libpq-dev: requerido por la gema pg (Postgres)
# - netcat-openbsd: para el script que espera a la base de datos
# - git/curl: útiles para mantenimiento
# - libyaml-dev: requerido para compilar la gema psych (YAML)
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    libyaml-dev \
    && rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /app

# Copiamos solo Gemfile y lock para aprovechar la caché de capas de Docker
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copiamos el resto del código
COPY . .

# Configuramos el script de entrada
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Arrancamos el servidor
CMD ["rails", "server", "-b", "0.0.0.0"]