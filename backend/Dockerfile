# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
ARG RB_FILES=/usr/src/api/
ARG RB_DBHOST=db:5432
ARG GEM_HOME=/usr/local/bundle

# NOTE n is working on ruby 4.0.3 but the base Alpine images only have 3.4.9-r0
# This first stage gets and compiles ruby 4.0.3 (now 4.0.5) on Alpine linux
FROM alpine:${ALP_VERSION} AS baseimage
# ARGs from global that we want to use in this stage
ARG RB_FILES
ARG GEM_HOME
ENV GEM_HOME=${GEM_HOME}
# stage-specific ARGs
ARG RUBY_VERSION=4.0.5
# NOTE Every time that RUBY_VERSION changes, this must be updated
ARG RUBY_DOWNLOAD_SHA256=7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e
# We build ruby in a subfolder of the extracted source tarball
ARG RB_BUILD=ruby-${RUBY_VERSION}/build

# HACK debug value can be removed
RUN echo $RUBY_VERSION
ENV RUBY_DOWNLOAD_URL=https://cache.ruby-lang.org/pub/ruby/4.0/ruby-${RUBY_VERSION}.tar.gz

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
RUN ["apk", "add", "tzdata"]
# https://docs.ruby-lang.org/en/master/contributing/building_ruby_md.html
RUN ./ruby-${RUBY_VERSION}/autogen.sh
RUN mkdir ${RB_BUILD}
WORKDIR ${RB_BUILD}
# NOTE --prefix sets the install location (right?)
RUN ../configure --prefix=/usr/local
RUN make -j"$(nproc)"
RUN make test
RUN make install

# NOTE from here the slowest part is done, try and avoid changes above here!

RUN echo ${GEM_HOME}
RUN mkdir -p ${RB_FILES}
RUN mkdir -p ${GEM_HOME}/
WORKDIR ${RB_FILES}
# FIXME tzdata is not found by the app and I have no idea why
COPY Gemfile Gemfile.lock $RB_FILES
# NOTE as well as the app folder we need (at least) config and db
# NOTE but only in the next stage!Ensure that this gives us 3 separate folderes in $RB_FILES!
# NOTE We *must* have this else can't run it on our Alpine container
# Change Workdir else we can't find the Gemfile
# NOTE A lot of careful setup that may not be needed
RUN gem install bundler --no-document
RUN bundle config set --local path ${GEM_HOME}
RUN bundle add tzinfo-data
RUN bundle lock --add-platform x86_64-linux-musl
RUN bundle config set  clean true
RUN bundle install --jobs 4 --retry 3
RUN bundle config set --local bin ${GEM_HOME}
RUN bundle binstubs --all
# TODO Run as a different user? bundler complains if run as root...
# HACK more debug
# FIXME rails not found here, but is it checking anything useful?
#  HACK test do we even need this?
#  COPY tools/src/ ${RB_FILES}

# HACK debug what we got where
RUN pwd
RUN ls -lar
# Clean builder to keep artifacts small (remove source tarball & build dir)
WORKDIR /
RUN rm -rf /ruby-${RUBY_VERSION} /ruby.tar.gz /var/cache/apk/*

LABEL org.opencontainers.image.tag="rubybase" \
org.opencontainers.image.vendor="${author}" \
org.opencontainers.image.description="Ruby ${RUBY_VERSION} built from source, including Gems"



# NOTE This stage copies the compiled ruby and relevant pieces to a fresh Alpine
# final runtime stage
FROM alpine:${ALP_VERSION} AS runtime

# NOTE ARG without default re-uses the global from the top of the file
ARG RB_FILES
ARG GEM_HOME
# Set ENV used in this stage
ENV GEM_HOME=${GEM_HOME}
ENV BUNDLE_PATH=/usr/local/bundle
ENV BUNDLE_BIN=/usr/local/bundle/bin
# HACK the path should be set using variables referring to previous build stage
# ...here and other places...
ENV PATH=$PATH:/usr/local/bin:/usr/local/bundle

RUN mkdir --parents $RB_FILES
# Copy app source files into the image
COPY --from=baseimage ${RB_FILES}/Gemfile ${RB_FILES}/Gemfile.lock ${RB_FILES}
# Copy only runtime files from builder. Commented lines are not (currently) present
COPY --from=baseimage /usr/local/bin/ruby /usr/local/bin/ruby
# COPY --from=baseimage /usr/local/bin/rails /usr/local/bin/rails
COPY --from=baseimage /usr/local/bin/erb /usr/local/bin/erb
COPY --from=baseimage /usr/local/bin/irb /usr/local/bin/irb
COPY --from=baseimage /usr/local/bin/gem /usr/local/bin/gem
COPY --from=baseimage /usr/local/bin/bundle /usr/local/bin/bundle
COPY --from=baseimage /usr/local/lib/ruby /usr/local/lib/ruby
# COPY --from=baseimage /usr/local/lib/libruby.so* /usr/local/lib/
# COPY --from=baseimage /usr/local/lib/libruby.* /usr/local/lib/
COPY --from=baseimage /usr/local/share/ri /usr/local/share/ri

# NOTE Copy gems if present, i.e. uncomment as needed
# TODO This should be a variable BUNDLEPATH
COPY --from=baseimage ${BUNDLE_PATH} ${BUNDLE_PATH}

# Bring necessary system libs (detect common dirs on Alpine)
COPY --from=baseimage /lib /lib
COPY --from=baseimage /usr/lib /usr/lib
COPY --from=baseimage /etc/ssl/certs /etc/ssl/certs

WORKDIR $RB_FILES

# TODO Better copy the files now?
# COPY --from=baseimage ${RB_FILES} ${RB_FILES}
COPY . .
# COPY tools/src ${RB_FILES}

# COPY tools/src/app/ $RB_FILES/app/
# COPY tools/src/config/ $RB_FILES/config/
# COPY tools/src/db/ $RB_FILES/db/
# HACK Debugging what carries over
RUN bundle --version
RUN bundle show puma
RUN pwd
RUN ls -alr
# COPY Gemfile Gemfile.lock ./
# TODO We already did this, so should not be needed?
# RUN bundle install

ENV RAILS_ENV=production
ENV DATABASE_URL=${RB_DBHOST}
WORKDIR ${RB_FILES}
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
RUN apk add --no-cache yaml-dev
# ENV TZINFO_ZONEINFO=/usr/share/zoneinfo
# HACK debug check
RUN bundle list
RUN bundle show tzinfo-data
# CMD ["irb"]
# FIXME CMD should be rails but launching the app correctly
# CMD ["rails", "server"]
RUN chmod -R +x bin/docker-entrypoint
ENTRYPOINT ["bin/docker-entrypoint"]
CMD ["rails", "server", "-b", "0.0.0.0"]
