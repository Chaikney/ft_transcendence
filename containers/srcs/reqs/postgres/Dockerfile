# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
FROM alpine:${ALP_VERSION} AS baseimage

LABEL author=chaikney
LABEL projectpart=database
LABEL description="A postgres server to hold app data like the users, game results, etc"
EXPOSE 5432/tcp

# NOTE Configuration according to: https://wiki.alpinelinux.org/wiki/Postgresql
ENV DB_FILES=/usr/local/pgsql/data

# NOTE Have selected PG17 to match Debian stable, in case we need to switch base.
RUN ["apk", "add", "postgresql17-contrib", "postgresql17"]

# The datadir must be owned by the postgres user and group.
RUN mkdir --parents $DB_FILES
RUN chown -R postgres:postgres $DB_FILES
# Add location for the UNIX socket/lockfile and ensure we can write to it
RUN mkdir /var/run/postgresql
RUN chown -R postgres:postgres /var/run/postgresql

# Setup the DB cluster (must be run as postgres not root)
# https://www.postgresql.org/docs/17/creating-cluster.html
USER postgres:postgres
RUN initdb -D $DB_FILES
# TODO Adapt initialisation for PostgreSQL
# - Configure to allow external connections
# -- (change /etc/postgresql17/postgresql.conf)
# -- (change /etc/postgresql17/pg_hba.conf)

# TODO Set up database(s)
# - User name and password (shared with ruby)
# - schema or initialisation

# TODO IF this returns 3, the DB is poorly
# https://www.postgresql.org/docs/current/app-pg-ctl.html
# HEALTHCHECK pgctl status -D $DB_FILES

# https://www.postgresql.org/docs/17/server-start.html
CMD ["sh", "-c", "exec postgres -D $DB_FILES"]
