# Usamos una versión específica y estable
FROM ruby:3.3-slim AS base

# Instalamos dependencias necesarias:
# - build-essential: para compilar gemas con extensiones C
# - libpq-dev: requerido por la gema pg (Postgres)
# - libyaml-dev: NECESARIO para compilar la gema 'psych'
# - netcat-openbsd: para el script que espera a la base de datos
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libyaml-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Carpeta de trabajo
WORKDIR /app

# Configuramos bundler para evitar instalaciones innecesarias y mejorar la caché
ENV BUNDLE_PATH="/usr/local/bundle"

# Copiamos solo Gemfile y lock para aprovechar la caché de capas de Docker
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copiamos el resto del código
COPY . .

# Configuramos el script de entrada
>>>>>>> main-final
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Arrancamos el servidor
CMD ["rails", "server", "-b", "0.0.0.0"]
