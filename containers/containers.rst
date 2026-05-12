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
