# DevOps Specialist (Docker and infrastructure)

Takes the development from "code in a folder" to "live system". Prioritises *stability of the environment*.

## Key tasks

1. Container for each key component (Dockerfiles)

2. Basic orchestration of containers (docker compose)

3. Network ingress and reverse proxy (NGINX)

4. Security and production

## Guiding principles

- **Configuration as code** no container should require manual configuration. Everything should be in the `Dockerfile` or in  configuration files within the `/infra` folder.

- **Healthchecks** Keep track of the state of the infrastructure. If (for example) rails wants to connect to a database the container should automatically wait for it to be ready using tools such as `wait-for-it` or the native `HEALTHCHECK` functionality.

- **Identical environments** This role ensures that environment variables, API keys etc are kept up-to-date.

## Workflow and team syncrhonisation

1. **Continuous Iteration:** The role does not wait for the project to finish to begin work. The basic orcvhestration should be in place within 48 hours. 

2. **Volume management**: Ensure that the data in the databse is not lost when the containers are restarted or rebuilt.

3. **Self-documenting files**: A new user or developer should be aided in finding the information that they need in the place that they need it. Document the *why* of decisions in any particular `Dockerfile`.

4. **Make(file) things easy** Create and maintain a clean and comprehensible `Makefile` for use in the project. Suggested targets include:
- `make up` (bring the app up from scratch)
- `make down` (cleanly halt the app components)
- `make clean` (bring the app back to a pristine state, volumes and all)

## Quality check

Cleanliness is a key to this role. A 100 line `Dockerfile` would be bad. Hidden tricks would also be bad (so think about how to balance these two poles.) If `docker-compose` does not properly manage secrets, that is a sign of a low quality implementation.

Development should be *zero friction* whereby a new teammate can clone, run `make up` and see the app functioning without errors.

## AI note

This is a manual translation, update and paraphrase (by chaikney) of a document that I think was machine-generated originally.
