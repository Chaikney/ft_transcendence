-----------------
Containers README
-----------------

Written by chaikney, no AI used.

Folder structure
----------------

Everything related to deployment of the solution via docker (or alternate solution) lives in this "containers" folder.

::
   containers/
   |
   Makefile
   |
   *--srcs/
       |
       docker-compose.yml
	   |
      	*--reqs/
    	|   |
	    |   *--ruby
    	|  |
	    |   *--postgresql
    	|   |
    	|   *--web
	    |   |
    	|   *--...más?
    	|
    	*--secrets/

"Works on my machine"
---------------------

These containers are developed and tested using the following **host** platform and software.

- Debian 13 (stable as of project)
  In general, the requirements are met by whatever that is installed from `apt` with no further repositories added. This should ensure that the versions used are both widely available and stable.
- podman 5.4.2
- podman-docker 5.4.2
- podman-compose 1.3.0
- GNU make 4.4.1

That said, none of the host features used seem very exotic to me and I would be surprised if earlier versions of these programs fail to work. Let me know if they do!

Container base
--------------

For its small size, the container images are all based upon `Alpine Linux`. The core images from DockerHub are used as the base, and then built upon.

This approach is preferred for efficiency, educational, and safety reasons.

- Efficiency
  Starting from a small base and adding only the necessary parts makes for a significantly smaller and faster experience than using prepackaged images would.
- Educational
  Preformed images run the risk of being an inscrutable, opaque blob that the team can neither debug nor explain. By building the image up gradually, the files are more likely to be explicable during evaluation.
- Safety
  If there is nothing in the image that should not be there, then the surface area with potential for abuse is much smaller.

The version of Alpine used as the base is defined in the `.env` file and sourced by the `compose` file. This overrides the default values in the individual `Dockerfile` build instructions.

As of 2026-05-27 the current Alpine version is 3.23.4 and this means that the active versions of key packages will be as follows:

- NGINX: 1.30.2-r0
- PostgreSQL: 17.10-r0
  Stable v17 is chosen because it the version packaged for Debian 13, allowing us to switch bases if we really needed to.
- Ruby: 4.0.5
  Note that this differs from the above as it is *not* the default Alpine package. The API is developed in Ruby 4, which is not, at time of writing, packaged for Alpine. The ruby container downloads and installs this from source using variables in the `.env` if present.


How to use this
---------------

Developers you will get best results using `podman <https://podman.io/>`_, although I have tried to maintain the compatibility that the podman CLI claims to offer. If you use the Makefile (I hope) you won't notice any difference.

The Makefile has a set of targets that should be self-explanatory. They will allow you to build the containers and launch the app as well as managing storage and secrets. Some of the key ones are:

 - help
   Lists existing targets and their state of readiness.
 - builds
   Build  *all* the necessary containers.
 - secrets
   Generate necessary secrets (e.g. database passwords) that are needed to run but should not be kept in the repository.
 - start / stop
   Set the cluster of services running, or shut them down.

Note that if you change the $(BASECMD) variable in the Makefile from podman to docker, it *should*  still work the same. File a bug if not!

Why podman?
-----------

Docker runs a persistent daemon and runs with root privileges. These are two things I prefer to avoid, being both paranoid and resource-constrained.

Resources and AI Disclosure
---------------------------

As ever, no LLMs have been used to write the documentation here. No grammar checker either, only good old ispell.

None of the Dockerfiles or similar content were LLM-generated. They may contain lines copied from "chats" with LLM systems with responses to queries about syntax. Nothing was added before I understood its purpose, and the files contain links to key parts of online documents where they are relevant. This should aid understanding and improvement of the containers.
