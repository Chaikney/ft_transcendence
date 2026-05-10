# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
ARG RUBY_VERSION=4.0.3

# NOTE n is working on ruby 4.0.3 but basic Alpine images only have 3.4.9-r0
# This SHA256 links to an image on dockerhub that would not resolve using tags
# BUT it times out, may not work at all.
# FROM docker.io/library/ruby@sha256:7252100ab2dd2e8d77dfb8fada7eb6cb3dbb7e96a59b3f122813165e627cd804 AS baseimage
#FROM ruby:${RUBY_VERSION}-alpine${ALP_VERSION} AS baseimage
FROM alpine:${ALP_VERSION} AS baseimage

LABEL author=chaikney
LABEL projectpart=Ruby
LABEL description="Container to run a ruby application (i.e. the sudoku game)"
# NOTE this is also the default port for rails as well as PHP apps
EXPOSE 3000/tcp

# NOTE The difference between ARG and ENV is...?
ARG RB_FILES=/usr/src/app
ARG RB_DBHOST=db:5432

WORKDIR $RB_FILES
RUN mkdir --parents $RB_FILES

# NOTE I lifted these steps from the page of the undownloadable image :|
ENV RUBY_DOWNLOAD_URL=https://cache.ruby-lang.org/pub/ruby/4.0/ruby-4.0.3.tar.gz
ENV RUBY_DOWNLOAD_SHA256=22cf6005d25bbe496b5ebe9224d63a1aaabfbfe02591bb5d612517c5a7836f29
ENV GEM_HOME=/usr/local/bundle

# RUN wget -O ruby.tar.xz "$RUBY_DOWNLOAD_URL"
# FIXME does not work - $ noot epanded ( but also it crasehd with the hash copied too, so... )
#RUN echo "$RUBY_DOWNLOAD_SHA256 *ruby.tar.xz" | sha256sum -c -s;
# TODO Confirm what extra packages are needed
# ...probably a database driver?
RUN ["apk", "add", "ruby", "ruby-bundler"]
RUN bundle config --global frozen 1

# TODO Add some source files to make this work
# COPY Gemfile Gemfile.lock ./
# RUN bundle install

# NOTE I have no idea what this would do, its from https://hub.docker.com/_/ruby/
COPY . .

# TODO Add correct name here
CMD ["./sudoku.rb"]
