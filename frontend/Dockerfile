ARG ALP_VERSION=3.23.4
# --- build stage (includes devDependencies for tsc & test typings) ---
FROM node:20-alpine AS build
WORKDIR /app

# Install common build tools needed for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first to leverage cache
COPY package.json package-lock.json ./
RUN npm install
# Install all deps (including devDependencies required for tsc)
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# FIXME this piece does not work (config)
# --- runtime stage (nginx) ---
FROM alpine:${ALP_VERSION} AS baseimage

# installs nginx (latest by default)
RUN ["apk", "add", "nginx"]
# Remove default nginx site and add custom config (optional - provide nginx.conf)
RUN rm -f /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

# Ensure correct ownership
RUN chown -R nginx:nginx /usr/share/nginx/html

# Run as non-root
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
