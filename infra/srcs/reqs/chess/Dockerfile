# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4

# NOTE n is working on ruby 4.0.3 but the base Alpine images only have 3.4.9-r0
# This first stage gets and compiles ruby 4.0.3 (now 4.0.5) on Alpine linux
FROM alpine:${ALP_VERSION} AS buildimage

# - add build-essential equivalent
RUN ["apk", "add", "build-base", "autoconf", "linux-headers", "bzip2-dev", "libffi-dev", "zlib-dev", "openssl-dev", "readline-dev", \
"gdbm-dev", "ncurses-dev",  "gperf", "libxml2-dev", "libxslt-dev"]
RUN ["apk", "add", "yaml-dev", "ca-certificates"]
# https://docs.ruby-lang.org/en/master/contributing/building_ruby_md.html
# TODO Copy the chess code
# TODO compile the chess code
RUN make -j"$(nproc)"

FROM alpine:${ALP_VERSION} AS runtime
# TODO Copy the binary to a new stage
# COPY --from=buildimage /lib /lib
# TODO Define interface
