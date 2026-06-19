ARG ALP_VERSION=3.23.4
ARG FE_FILES=/app
# --- build stage (includes devDependencies for tsc & test typings) ---
FROM node:20-alpine AS build
# WORKDIR /app
ARG FE_FILES
WORKDIR ${FE_FILES}

# Install common build tools needed for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first to leverage cache
COPY package.json package-lock.json ./
RUN npm install
# Install all deps (including devDependencies required for tsc)
RUN npm ci

# Copy source and build (everything from build context into WORKDIR)
COPY . .
RUN npm run build

# FIXME this piece does not work (config)
# --- runtime stage (nginx) ---
FROM alpine:${ALP_VERSION} AS baseimage
ARG FE_FILES

# installs nginx (latest by default)
RUN ["apk", "add", "nginx"]
# Remove default nginx site and add custom config (optional - provide nginx.conf)
RUN rm -f /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf
#COPY --chown=nginx nginx_minimal.conf /etc/nginx/nginx.conf
COPY --chown=nginx NGINX_example.conf etc/nginx/nginx.conf
COPY --chown=nginx secret/trans.crt /etc/ssl/certs/transcendence.crt
COPY --chown=nginx secret/trans.key /etc/ssl/private/transcendence.key

# Copy built static files
COPY --from=build ${FE_FILES}/dist /usr/share/nginx/html
# COPY --from=build /app/dist /usr/share/nginx/html

# Ensure correct ownership
RUN chown -R nginx:nginx /usr/share/nginx/html

# Run as non-root
# NOTE not doing this because it means can't bind to port 80 (obv)
# USER nginx

# TODO Do I need this? Should be handled in the compose file no?
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
