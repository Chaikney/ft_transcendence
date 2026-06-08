FROM ruby:4.0.3-slim AS base 
# (Nota: si tu .ruby-version dice otra versión, cambia el 3.2.2 por la tuya)

# Instalamos lo necesario para que PostgreSQL y Rails funcionen
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs bash libyaml-dev

# Carpeta donde vivirá el código
WORKDIR /app

# Copiamos las gemas e instalamos TODO (incluyendo las de desarrollo)
COPY Gemfile Gemfile.lock ./
RUN bundle install

# El script para evitar el error del server.pid
COPY bin/docker-entrypoint /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Arrancamos el servidor vinculándolo a todas las IPs
CMD ["rails", "server", "-b", "0.0.0.0"]