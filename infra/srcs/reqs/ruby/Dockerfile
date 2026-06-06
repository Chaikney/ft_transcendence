# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4

# NOTE n is working on ruby 4.0.3 but the base Alpine images only have 3.4.9-r0
# This first stage gets and compiles ruby 4.0.3 (now 4.0.5) on Alpine linux
FROM alpine:${ALP_VERSION} AS baseimage

ARG RUBY_VERSION=4.0.5
# NOTE Every time that RUBY_VERSION changes, this must be updated
ARG RUBY_DOWNLOAD_SHA256=7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e

# NOTE The difference between ARG and ENV is...?
# FIXME This is not getting used.
ARG RB_FILES=/usr/src/app
ARG RB_DBHOST=db:5432

RUN mkdir --parents $RB_FILES
# WORKDIR $RB_FILES

RUN echo $RUBY_VERSION
ENV RUBY_DOWNLOAD_URL=https://cache.ruby-lang.org/pub/ruby/4.0/ruby-${RUBY_VERSION}.tar.gz
ENV GEM_HOME=/usr/local/bundle

# Download Ruby version
# HACK to debug the download
RUN echo $RUBY_DOWNLOAD_URL
RUN wget -O ruby.tar.gz "$RUBY_DOWNLOAD_URL"
RUN printf '%s *%s\n' "$RUBY_DOWNLOAD_SHA256" "ruby.tar.gz" | sha256sum -c -s
# RUN tar t -f ruby.tar.gz
RUN tar -xzf ruby.tar.gz
# Install the ruby from source (and freeze image there?)
# - add build-essential equivalent
RUN ["apk", "add", "build-base", "autoconf", "linux-headers", "bzip2-dev", "libffi-dev", "zlib-dev", "openssl-dev", "readline-dev", \
"gdbm-dev", "ncurses-dev",  "gperf", "libxml2-dev", "libxslt-dev"]
RUN ["apk", "add", "yaml-dev", "ca-certificates"]
# https://docs.ruby-lang.org/en/master/contributing/building_ruby_md.html
RUN ./ruby-${RUBY_VERSION}/autogen.sh
RUN mkdir ruby-${RUBY_VERSION}/build
WORKDIR ruby-${RUBY_VERSION}/build
RUN ../configure --prefix=/usr/local
RUN make -j"$(nproc)"
RUN make test
RUN make install
#
# NOTE from here the slowest part is done, try and avoid changes above here!
#
# TODO Confirm what extra packages are needed for our app
# Install bundler if you need gems at build time (optional)
# RUN gem install bundler --no-document
# ...probably a database driver? "pg"?
# TODO Check these locations are correct...
# TODO what does *this* line do?
RUN bundle config --global frozen 1
COPY tools/src/Gemfile tools/src/Gemfile.lock ./
# NOTE as well as the app folder we need (at least) config and db
COPY tools/src/app $RB_FILES
COPY tools/src/config $RB_FILES
COPY tools/src/db $RB_FILES
# NOTE We *must* have this else can't run it on our Alpine container
RUN bundle lock --add-platform x86_64-linux-musl
# TODO Run as a different user? bundler complains if run as root...
RUN bundle install

# Clean builder to keep artifacts small (remove source tarball & build dir)
WORKDIR /
RUN rm -rf /ruby-${RUBY_VERSION} /ruby.tar.gz /var/cache/apk/*

LABEL org.opencontainers.image.tag="rubybase" \
org.opencontainers.image.vendor="${author}" \
org.opencontainers.image.repo="memememe" \
org.opencontainers.image.description="Ruby ${RUBY_VERSION} built from source"




# NOTE This stage copies the compiled ruby and relevant pieces to a fresh Alpine
# final runtime stage
FROM alpine:${ALP_VERSION} AS runtime

ARG RB_FILES=/usr/src/app
ENV GEM_HOME=/usr/local/bundle
ENV PATH=$PATH:/usr/local/bin:/usr/local/bundle/bin

RUN mkdir --parents $RB_FILES

# Copy only runtime files from builder. Commented lines are not (currently) present
COPY --from=baseimage /usr/local/bin/ruby /usr/local/bin/ruby
COPY --from=baseimage /usr/local/bin/erb /usr/local/bin/erb
COPY --from=baseimage /usr/local/bin/irb /usr/local/bin/irb
COPY --from=baseimage /usr/local/bin/gem /usr/local/bin/gem
COPY --from=baseimage /usr/local/bin/bundle /usr/local/bin/bundle
COPY --from=baseimage /usr/local/lib/ruby /usr/local/lib/ruby
# COPY --from=baseimage /usr/local/lib/libruby.so* /usr/local/lib/
# COPY --from=baseimage /usr/local/lib/libruby.* /usr/local/lib/
COPY --from=baseimage /usr/local/share/ri /usr/local/share/ri

# NOTE Copy gems if present, i.e. uncomment as needed
COPY --from=baseimage /usr/local/bundle /usr/local/bundle

# Bring necessary system libs (detect common dirs on Alpine)
COPY --from=baseimage /lib /lib
COPY --from=baseimage /usr/lib /usr/lib
COPY --from=baseimage /etc/ssl/certs /etc/ssl/certs

WORKDIR $RB_FILES

# TODO Copy app source files into the image
# COPY Gemfile Gemfile.lock ./
# RUN bundle install

# NOTE I have no idea what this would do, its from https://hub.docker.com/_/ruby/
# COPY . .
# NOTE Putting the metadata here to avoid breaking cached layers, move up after
LABEL author=chaikney
LABEL name=ruby_img
LABEL projectpart=Ruby
LABEL description="Container to run a ruby application (i.e. the sudoku game)"
# NOTE this is also the default port for rails as well as PHP apps
EXPOSE 3000/tcp
# NOTE This might not be any use at all, have added tagging to the Makefile instead.
LABEL org.opencontainers.image.tag="ruby" \
org.opencontainers.image.vendor="${author}" \
org.opencontainers.image.repo="memememe" \
org.opencontainers.image.description="Ruby ${RUBY_VERSION} built from source"
LABEL org.opencontainers.image.source="https://cache.ruby-lang.org/pub/ruby/4.0/ruby-\${VERSION}.tar.gz"
ENV IMAGE_TAG="My awesome ruby box"
# NOTE Example that relies on the preseence/configuration of rails healthcontroller
# IT is inactive for now
# HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:3000/up || exit 1

# CMD ["irb"]
# FIXME CMD should be rails but launching the app correctly
CMD ["rails", "server"]
