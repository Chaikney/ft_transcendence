FROM ruby:4.0.3-slim AS base 

# Instalamos lo necesario para que PostgreSQL y Rails funcionen
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs bash libyaml-dev

# Carpeta donde vivirá el código dentro del contenedor
WORKDIR /app

# Copiamos las gemas e instalamos
COPY Gemfile Gemfile.lock ./
RUN bundle install

# 🟢 AÑADIMOS ESTO: Copia todo el resto del código del backend dentro del contenedor
COPY . .

# El script para evitar el error del server.pid
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Arrancamos el servidor vinculándolo a todas las IPs
CMD ["rails", "server", "-b", "0.0.0.0"]