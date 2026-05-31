# 42 Makefile
# by chaikney

NAME	=	ft_transcendence
# A name to help tag the containers
REPO	=	team42
# Location of the compose file
BASEDIR	=	./srcs
# Location of the individual containers (in their subfolders)
CONTHOME=	$(BASEDIR)/reqs

# NOTE Change BASECMD to docker if that is what is being used
# TODO Ideally this would work interchangeably but I bet it doesn't
BASECMD	=	podman

all: $(NAME)

$(NAME): start

# Launch the cluster / pod of 3 containers
# NOTE podman compose and podman-compose behave differently! BOOOO!
# NOTE !! if you get a "cant get socket" error, *LAUNCH THE podman.socket SERVICE!
start: secrets
	@echo "Building and launching the 3 containers"
	@echo "NOTE This command does not work realiably yet!"
	$(BASECMD) compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" up

stop:
# stop all the running containers
	@echo "Stopping our containers"
	@echo "NOTE This is untested"
	$(BASECMD) compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" down

# NOTE These builds run separately from the "compose"-triggered make targets, so mostly for testing.
# ...containers are "interesting" like that
builds: web-build db-build ruby-build
	@echo "All containers now built"

# NOTE Podman / OCI format ignores HEALTHCHECK therefore build container with --format=docker
# TODO when the source is available, make this depend on web_src
web-build: server_cert
#web-build: server_cert web_src
	@echo "Building NGINX container..."
	$(BASECMD) build -f $(CONTHOME)/web/Dockerfile --tag $(REPO)/web:0.1

db-build: secrets
	@echo "Building database container..."
	$(BASECMD) build -f $(CONTHOME)/postgres/Dockerfile --tag $(REPO)/db:0.1

# FIXME if we have the ruby version, it should be actually correct and not hardcoded...
ruby-build: secrets
	@echo "Building ruby container..."
	$(BASECMD) build -f $(CONTHOME)/ruby/Dockerfile --tag $(REPO)/ruby:4.0.5

# Launch the cluster with rebuilt containers (will use cache if present)
rebuild:
	$(BASECMD)-compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" up --build

# Finding or generating secrets that are not in the repo
secrets: secret/rb_dbpass server_cert
	@echo "Ensuring presence of necessary secret values"

# Generates a random password for database access
secret/rb_dbpass:
	@echo "Generating rb_dbpass"
	@umask 077;
	tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32 > $@.tmp;
	mv $@.tmp $@;

secret/testprivate.key:
	@echo "Generating private key..."
	openssl genrsa -out testprivate.key 2048
	mv testprivate.key $@;

secret/trans.crt: secret/testprivate.key
	@echo "Generating signing request..."
	openssl req -new -subj "/C=ES/CN=Transcendence project/ST=Bizkaia/O=Team 42" \
		-key secret/testprivate.key -out secret/testprivate.csr
	@echo "Generating self-signed cert..."
	openssl x509 -req -days 365 -in secret/testprivate.csr -signkey secret/testprivate.key -out trans.crt
	mv trans.crt $@

# TODO This "relinks"/ never says it has nothing to do, even if the keys are in place
server_cert: secret/trans.crt
	@echo "Copying web certs to build context"
	cp secret/testprivate.key $(CONTHOME)/web/secret/trans.key
	cp secret/trans.crt $(CONTHOME)/web/secret/trans.crt

web_src:
	@echo "Copying react source to build context"
	cp -r  --update ../Frontend/src $(CONTHOME)/web/tools

# Convenience / convention rules; not properly worked out or needed yet
# TODO test this
wipe: stop
	@echo "Removing all storage volumes"
	@echo "TODO Untested so far"
	$(BASECMD) volume prune --all --force

nuke: stop fclean wipe

clean: stop
# delete all the built containers
	@echo "Removing all the cached pieces"
	$(BASECMD) system prune --force

# NOTE This is only included for sentimental / convention reasons
fclean: clean
	@echo "Removing all build objects"
	$(BASECMD) system prune --all --force

# NOTE Ideally this should "re"build the containers not just start them up again.
re: fclean all

# NOTE echo -e is not guaranteed to be 100% portable. Works for this project though.
help:
	@echo -e "There are various targets to manage the build, launch and management of \
the containers in this project.\n\
The targets are:\n \
* ft_transcendence (or all, or no target)\tlaunch the whole project\n \
* builds\t\tTODO build all the containers needed for the project\n \
* stop\t\thalt any running containers, using compose\n \
* make_volume (?)\t\tTODO (maybe)\n \
* secrets\tEnsure we have a database password and web certificates\n \
* re\t\tTODO launch the containers while forcing their rebuild\n \
* clean\tremoves the cached parts of containers\n \
* fclean\tremoves the cached parts of containers, with --force option\n \
* wipe\t\tremoves the storage volumes. Destructive!\n \
* nuke\t\tRemove container cache *and* the storage volumes. Very destructive!"

.PHONY: clean, all, fclean, re, wipe, nuke, help
