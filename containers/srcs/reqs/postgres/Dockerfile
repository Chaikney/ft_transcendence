# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
FROM alpine:${ALP_VERSION} AS baseimage

LABEL author=chaikney
LABEL projectpart=database
LABEL description="A postgres server to hold app data like the users, game results, etc"
EXPOSE 5432/tcp

# NOTE Configuration according to: https://wiki.alpinelinux.org/wiki/Postgresql
ARG DB_FILES=/usr/local/pgsql/data

# NOTE Have selected PG17 to match Debian stable, in case we need to switch base.
RUN ["apk", "add", "postgresql17"]

# The datadir located at /var/lib/mysql must be owned by the mysql user and group.
# The location of the datadir can be changed by editing the mariadb service file in /etc/init.d.
# The new location will also need to be set by adding datadir=<YOUR_DATADIR> in the [mysqld] section in a mariadb configuration file.
RUN mkdir --parents $DB_FILES
# TODO Change this to whatever the PG username is, if needed.
# RUN chown -R mysql:mysql $DB_FILES

# TODO Adapt initialissation for PostgreSQL
# Normal initialization of mariadb can be done as follows:
#     Initialize MySQL Data Directory. mariadb-install-db --user=mysql --datadir=/var/lib/mysql
#RUN ["mariadb-install-db" , "--user=mysql", "--datadir=/var/lib/mysql"]
# RUN mariadb-install-db --user=mysql --datadir=$DB_FILES --skip-test-db

# TODO Add any the setup script to the image

# TODO IF this returns 3, the DB is poorly
# https://www.postgresql.org/docs/current/app-pg-ctl.html
# HEALTHCHECK pgctl status -D $DB_FILES

# TODO Who knows if this works
ENTRYPOINT ["postgresql -D $DB_FILES"]
