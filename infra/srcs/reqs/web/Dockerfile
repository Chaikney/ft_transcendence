# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
FROM alpine:${ALP_VERSION} AS buildimage

ARG SRCDIR=tools/frontend
ARG DESTDIR=/app
# get the NPM pieces
RUN ["apk", "add", "npm", "typescript"]
# NOTE Make sure we have a user?
RUN mkdir $DESTDIR
# RUN chown -R npm:npm $DESTDIR
WORKDIR $DESTDIR
# TODO Copy websource, check the location / WORKDIR etc
COPY $SRCDIR/package.json $SRCDIR/package-lock.json $DESTDIR
COPY $SRCDIR $DESTDIR
# run npm build or whatever, that should put things in DESTDIR/build
# Use npm ci if you need a deterministic, repeatable build.
# For example during continuous integration, automated jobs, etc.
# and when installing dependencies for the first time, instead of npm install.
# NOTE install and ci doesn't make a difference at this point (it doesn't build)
RUN npm install
#RUN npm ci
RUN npm run build
LABEL author=chaikney
LABEL projectpart=nodebuilder
LABEL description="Build frontend with NPM"

FROM alpine:${ALP_VERSION} AS weblayer
# this can be overridden by docker run,
# but serves as useful documentation.
EXPOSE 443/tcp
LABEL author=chaikney
LABEL projectpart=webserver
LABEL description="An NGINX server to display pages on SSL / 443 *only*"

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
# COPY --chown=nginx tools/index.html /var/www
# TODO This should fail if source does not exist.
# TODO This should be the build directory now I think.
COPY --from=buildimage --chown=nginx $DESTDIR/build /var/www/app
# AI-generated health check, changed to have no external dependencies
# NOTE Podman / OCI format ignores HEALTHCHECK therefore build container with --format=docker
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD nginx -t || exit 1

# start nginx in the foreground
# (if in background it might just disappear)
CMD ["nginx", "-g", "daemon off;"]
