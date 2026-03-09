---
title: Docker Basics
tags: [docker, devops, containers]
created: 2025-02-05
author: Nid
description: Getting started with Docker containerization
draft: false
---

# Docker Basics

Docker is a platform for building, running, and shipping applications in containers.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Image** | A read-only template with instructions for creating a container |
| **Container** | A runnable instance of an image |
| **Dockerfile** | A text file with instructions to build an image |
| **Volume** | Persistent data storage for containers |
| **Network** | Communication channel between containers |

## Common Commands

### Images

```bash
# Pull an image
docker pull node:20-alpine

# List images
docker images

# Build an image
docker build -t myapp:latest .

# Remove an image
docker rmi myapp:latest
```

### Containers

```bash
# Run a container
docker run -d -p 3000:3000 --name myapp myapp:latest

# List running containers
docker ps

# Stop a container
docker stop myapp

# View logs
docker logs -f myapp
```

## Dockerfile Example

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

> [!TIP]
> Use multi-stage builds to reduce final image size. Copy only what you need from the build stage.

## Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db
  
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret

volumes:
  pgdata:
```

> [!NOTE]
> Always use `.dockerignore` to exclude `node_modules`, `.git`, and other unnecessary files from the build context.
