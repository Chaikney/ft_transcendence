# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4

# NOTE n is working on ruby 4.0.3 but basic Alpine images only have 3.4.9-r0
# This SHA256 links to an image on dockerhub that would not resolve using tags
# BUT it times out, may not work at all.
# FROM docker.io/library/ruby@sha256:7252100ab2dd2e8d77dfb8fada7eb6cb3dbb7e96a59b3f122813165e627cd804 AS baseimage
#FROM ruby:${RUBY_VERSION}-alpine${ALP_VERSION} AS baseimage
FROM alpine:${ALP_VERSION} AS baseimage

ARG RUBY_VERSION=4.0.3

# NOTE The difference between ARG and ENV is...?
ARG RB_FILES=/usr/src/app
ARG RB_DBHOST=db:5432

RUN mkdir --parents $RB_FILES
# WORKDIR $RB_FILES

# NOTE I lifted these steps from the page of the undownloadable image :|
RUN echo $RUBY_VERSION
ENV RUBY_DOWNLOAD_URL=https://cache.ruby-lang.org/pub/ruby/4.0/ruby-${RUBY_VERSION}.tar.gz
ENV RUBY_DOWNLOAD_SHA256=77964acc370d5c8375b9502e5ba6c13c03ef91ab9eb9f521c84fb42b9c9a6b0f
ENV GEM_HOME=/usr/local/bundle

# Download Ruby version
# HACK to debug the download
RUN echo $RUBY_DOWNLOAD_URL
RUN wget -O ruby.tar.gz "$RUBY_DOWNLOAD_URL"
RUN printf '%s *%s\n' "$RUBY_DOWNLOAD_SHA256" "ruby.tar.gz" | sha256sum -c -s
# RUN tar t -f ruby.tar.gz
RUN tar -xzf ruby.tar.gz
# TODO Installl the ruby from source (and freeze image there?)
# - add build-essential equivalent
RUN ["apk", "add", "build-base", "autoconf", "linux-headers", "bzip2-dev", "libffi-dev", "zlib-dev", "openssl-dev", "readline-dev", \
"gdbm-dev", "ncurses-dev",  "gperf", "libxml2-dev", "libxslt-dev"]
RUN ["apk", "add", "yaml-dev"]
# configure make make install?
RUN ./ruby-${RUBY_VERSION}/autogen.sh
RUN mkdir ruby-${RUBY_VERSION}/build
WORKDIR ruby-${RUBY_VERSION}/build
RUN  ../configure --prefix=${RB_FILES}
# RUN cd ruby-${RUBY_VERSION}
RUN make
# FIXED? needs a target directory I think...
# https://docs.ruby-lang.org/en/master/contributing/building_ruby_md.html
RUN make test
RUN make install
# TODO ruby has to be on PATH, why does make install not do that?
# TODO Confirm what extra packages are needed for our app
# ...probably a database driver? "pg"?
# RUN bundle config --global frozen 1

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
# NOTE This might not be any use at all, have added tagging to the Makefile instead.
EXPOSE 3000/tcp
LABEL org.opencontainers.image.tag="ruby" \
org.opencontainers.image.vendor="${author}" \
org.opencontainers.image.repo="memememe" \
org.opencontainers.image.description="Ruby ${RUBY_VERSION} built from source"
LABEL org.opencontainers.image.source="https://cache.ruby-lang.org/pub/ruby/4.0/ruby-\${VERSION}.tar.gz"
ENV IMAGE_TAG="My awesome ruby box"
# TODO Add correct name here
# CMD ["./sudoku.rb"]
# CMD["irb"]
#CMD["./ruby -e \"puts 'Hello, World!'\""]
# CMD ["bash", "-lc", "exec ruby your_app.rb"]
CMD ["ruby -v"]
