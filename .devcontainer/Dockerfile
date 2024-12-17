FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Add some utilities
# `bash-completion` some tools (e.g. git) can use this
RUN apt-get update \
	&& apt-get install -y vim bash-completion

# Force the use of a correct version whatever no matter the image image
COPY .nvmrc /opt/.nvmrc
# Force the use of the nvm version
RUN . ${NVM_DIR}/nvm.sh && nvm install $(cat /opt/.nvmrc) && rm /opt/.nvmrc

# listen in 127.0.0.1 to the docker service (mostly to not exit the dockerfile)
CMD ["socat", "tcp-listen:1883,reuseaddr,fork", "tcp:broker_local:1883"]
