# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4

FROM alpine:${ALP_VERSION} AS buildimage
# This builds stockfish from source
ARG BIN_NAME = chess
ARG BIN_LOC = /usr/local/bin
# - add build-essential equivalent
RUN ["apk", "add", "build-base", "autoconf", "linux-headers", "bzip2-dev", "libffi-dev", "zlib-dev", "openssl-dev", "readline-dev", \
"gdbm-dev", "ncurses-dev",  "gperf", "libxml2-dev", "libxslt-dev"]
RUN ["apk", "add", "yaml-dev", "ca-certificates"]
# TODO Copy the chess code
RUN mkdir --parents src
COPY tools/src/* ./src
WORKDIR ./src

# HACK if you want to try stockfish...
# RUN git clone --depth=1 https://github.com/official-stockfish/Stockfish.git
# WORKDIR Stockfish/src
# compile the chess code
RUN make -j"$(nproc)"
# RUN make install

# end of first stage

FROM alpine:${ALP_VERSION} AS runtime
# # Copy the binary to a new stage
# COPY --from=buildimage ${BIN_LOC}/${BIN_NAME} /usr/local/bin
# FIXME More files have to be copied I thiink.
COPY --from=buildimage /src/chess /usr/local/bin
COPY --from=buildimage /usr/lib/* /usr/lib
# # TODO Define interface
CMD ["/usr/local/bin/chess"]
