# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4

FROM alpine:${ALP_VERSION} AS buildimage
# This builds stockfish from source
ARG BIN_NAME = stockfish
ARG BIN_LOC = /usr/local/bin
# - add build-essential equivalent
RUN ["apk", "add", "build-base", "autoconf", "linux-headers", "bzip2-dev", "libffi-dev", "zlib-dev", "openssl-dev", "readline-dev", \
"gdbm-dev", "ncurses-dev",  "gperf", "libxml2-dev", "libxslt-dev"]
RUN ["apk", "add", "git"]
RUN ["apk", "add", "yaml-dev", "ca-certificates"]
# TODO Copy the chess code
# HACK lets try stockfish...
RUN git clone --depth=1 https://github.com/official-stockfish/Stockfish.git
WORKDIR Stockfish/src
# compile the chess code
# TODO For stockfish, can we define / cache the build details in advance to avoid nnue download?
RUN make -j"$(nproc)" profile-build
RUN make install

# end of first stage

FROM alpine:${ALP_VERSION} AS runtime
# # Copy the binary to a new stage
# COPY --from=buildimage ${BIN_LOC}/${BIN_NAME} /usr/local/bin
# FIXME More files have to be copied I thiink.
COPY --from=buildimage /usr/local/bin/stockfish /usr/local/bin
COPY --from=buildimage /usr/lib/* /usr/lib
# # TODO Define interface
# TODO How do you make stockfish sit and wait?
CMD ["/usr/local/bin/stockfish", "isready"]
