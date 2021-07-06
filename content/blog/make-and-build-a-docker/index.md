---
title: Make and build a Dockerfile memo
date: 2021-07-01T04:20:18.198Z
tags: 
  - "docker"
  - "k8s"
category: devops
description: a simple memo about how to make and build a Dockerfile
---

Specify a base image → Run commands to install additional programs → Specify a command to run on container startup

Besides the base image, docker uses container to build.

1. when dokcer sees RUN command, it will look for the previous step image.
2. docker create temp image using the previous step. runs the command inside the container. Now the container has the file system snapshot after the RUN. Then, it took the file system away and stop the container. Then save the file system into a new container.

An image contains fs snapshot and startup command.

```bash
# Use an eisting docker image as a base
FROM alpine

# Download and install dependencies docker will use cache if possible.
RUN apk add --update redis
RUN apl add --update gcc

# Tell the image what to do when it starts as a container.
CMD ["redis-server"]
```

## Add a tag to the image

```bash
# Add a tag to the image you build
# dont forget the dot to specify the context.
docker build -t <name you want> .
# how to define a tag by convention
<name/docker ID>/<project name>:<version>
```

### docker commit(Don't use)

take a snapshot of the container and base on that build an image.

```bash
docker commit -c 'CMD ["redis-server"]' <container ID>
```

If use alpine, you can change other base image or install necessary tools you want.

`FROM <baseimage>:<tag>`

alpine (as small as possible)

`COPY <your dir> <target dir>`

```jsx
./ is for directory relative to current context.
```

If you need to access the container's network, you should setup port mapping. Port mapping is a run time command that can be only specify during docker run.

```jsx
-p <port on local machine>:<port inside the container>
```

If you copy file inside the container, you should create a WORKDIR in order to avoid file conflict.

```docker
# Define a work dir in the docker file.
WORKDIR /usr/app
# use usr is because usr folder is a safer location in Linux.
# any following command will be executed relative to this path in the container.
```

## Unnecessary rebuilds

reorder the build process to avoid rebuilds if you are creating a Nodejs project. For example, put COPY command after the install step so the build would not rerun `npm install` again unless the package.json file is changed.