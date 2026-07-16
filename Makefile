# 42 Makefile
# by chaikney

NAME	=	ft_transcendence
# A name to help tag the containers
REPO	=	team42
# Location of the compose file
BASEDIR	=	./
# Location of the individual containers (in their subfolders)

# NOTE Change BASECMD to podman if you have that on your machine; it should work the same.
BASECMD	=	docker
SOCK	=	/run/podman/podman.sock
SOCK_UNIT=	podman.socket
ENV_FILE=	.env
42_FILE	=	secret/42API_SEC


all: $(NAME)

$(NAME): start

# Ensure that we have podman available. NOTE some of these are "nice to have" not essential
check_host:
	@which $(BASECMD) >/dev/null 2>&1 || { echo "container controller not found"; exit 1; }
	@which systemctl >/dev/null 2>&1 || { echo "service manager not found"; exit 1; }
	@systemctl is-active --quiet $(SOCK_UNIT) || { echo "$(SOCK_UNIT) not active - this might cause problems"; exit 0; }
	@podman system connection --log-level=error >/dev/null 2>&1 || { echo "podman connection failed"; exit 0; }

# Fail fast if .env is missing
# NOTE this is a *pre-launch* check not to be confused with review_env below
check_env:
	@test -f "$(ENV_FILE)" || (echo "Error: $(ENV_FILE) file not found, cannot launch containers without it." && exit 1)

check_keys:
	@test -f "$(42_FILE)" || (echo "Error: $(42_FILE) file not found, cannot launch containers without it." && exit 1)

# Evaluator convenience: use this to check the container ENV VARs
review_envs:
	@echo "About to print ENV of all running containers..."
	@${BASECMD} ps -q | xargs -r -I {} sh -c '\
		echo "== $$(${BASECMD} inspect -f "{{.Name}}" {}) =="; ${BASECMD} exec {} printenv'

# Launch the cluster / pod of 3 containers
# NOTE podman compose and podman-compose behave differently! BOOOO!
# NOTE !! if you get a "cant get socket" error, *LAUNCH THE podman.socket SERVICE!
start: check_host check_env secrets
	@echo "Building and launching the containers"
	@echo "BASEDIR is $(BASEDIR)"
	$(BASECMD) compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" up

stop:
# stop all the running containers
	@echo "Stopping our containers"
	$(BASECMD) compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" down

# Launch the cluster with rebuilt containers (will use cache if present)
rebuild:
	@echo "Rebuilding and launching the containers"
	$(BASECMD)-compose -f "$(abspath $(BASEDIR)/docker-compose.yml)" up --build

# Finding or generating secrets that are not in the repo
secrets: secret_dir check_keys secret/rb_dbpass server_cert
	@echo "Ensuring presence of necessary secret values"

secret_dir:
	@echo "Creating secrets dir if it doesn't already exist"
	mkdir --parents secret

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
	mkdir --parents frontend/secret
	cp --update secret/testprivate.key frontend/secret/trans.key
	cp --update secret/trans.crt frontend/secret/trans.crt

# Convenience / convention rules; not properly worked out or needed yet
wipe: stop
	@echo "Removing all storage volumes"
	$(BASECMD) volume prune --force

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
* check_host\tEnsure that the container controller is present\n \
* check_env\tEnsure that the environment file is present\n \
* builds\t\tTODO build all the containers needed for the project\n \
* stop\t\thalt any running containers, using compose\n \
* secrets\tEnsure we have a database password and web certificates\n \
* re\t\tTODO launch the containers while forcing their rebuild\n \
* clean\tremoves the cached parts of containers\n \
* fclean\tremoves the cached parts of containers, with --force option\n \
* wipe\t\tremoves the storage volumes. Destructive!\n \
* nuke\t\tRemove container cache *and* the storage volumes. Very destructive!"

.PHONY: clean, all, fclean, re, wipe, nuke, help, review_envs, check_host, check_env, check_keys, start, stop
