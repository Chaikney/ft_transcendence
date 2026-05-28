# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
FROM alpine:${ALP_VERSION} AS baseimage

LABEL author=chaikney
LABEL projectpart=webserver
LABEL description="An NGINX server to display pages on SSL / 443 *only*"

# this can be overridden by docker run,
# but serves as useful documentation.
EXPOSE 443/tcp

# installs nginx (latest by default)
RUN ["apk", "add", "nginx"]

# TODO Configuration - split into manageable pieces
COPY tools/NGINX_example.conf /etc/nginx/http.d/default.conf
# TODO SSL-specific config like key locations
# COPY tools/self-signed.conf /etc/nginx/snippets/

# NOTE These are excluded from the repo! Must be populated elsewise
# NOTE these end up baked into the image but they kind of have to be, without LetsEncrypt
COPY --chown=nginx secret/trans.crt /etc/ssl/certs/transcendence.crt
COPY --chown=nginx secret/trans.key /etc/ssl/private/transcendence.key
# HACK until the real frontend exists
COPY --chown=nginx tools/index.html /var/www
# TODO This should fail if source does not exist.
# TODO Check that these locations are correct, and define in .env if possible
# COPY --chown=nginx tools/src /var/www/app
# AI-generated health check, changed to have no external dependencies
# NOTE Podman / OCI format ignores HEALTHCHECK therefore build container with --format=docker
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD nginx -t || exit 1

# start nginx in the foreground
# (if in background it might just disappear)
CMD ["nginx", "-g", "daemon off;"]
