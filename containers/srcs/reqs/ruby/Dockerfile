# syntax=docker/dockerfile:1

ARG ALP_VERSION=3.23.4
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
