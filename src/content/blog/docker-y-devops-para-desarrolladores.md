---
title: "Docker y DevOps para Desarrolladores en Latinoamérica"
description: "Aprende a utilizar Docker y DevOps para mejorar la eficiencia y la colaboración en tu equipo. Descubre cómo implementar contenedores Docker y prácticas DevOps en Latinoamérica."
keywords: "docker tutorial, devops latam, contenedores docker, docker y devops, desarrollo de software, docker compose, ci cd latam, docker nodejs"
tag: "DevOps · Docker"
tagSlug: "devops"
publishedDate: 2026-04-24
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

En el mundo del desarrollo de software moderno, Docker y DevOps se han convertido en habilidades fundamentales para cualquier desarrollador que quiera trabajar de forma profesional. En Latinoamérica, donde muchos proyectos se desarrollan en equipos distribuidos y con infraestructura variada, estas herramientas marcan la diferencia entre un entorno de desarrollo caótico y uno predecible y reproducible.

En este artículo voy a mostrarte cómo uso Docker y prácticas DevOps en mis proyectos reales, con ejemplos de configuración listos para producción.

## ¿Qué es Docker y por qué importa?

Docker es una plataforma de **contenerización**: empaqueta tu aplicación junto con todas sus dependencias (librerías, runtime, variables de entorno) en una unidad portable llamada **contenedor**. El contenedor se ejecuta de forma idéntica en tu máquina local, en el servidor de un compañero o en producción.

El problema clásico que resuelve: *"En mi máquina funciona"*.

**Ventajas para proyectos en Latinoamérica:**
- Entornos reproducibles sin importar el sistema operativo del desarrollador
- Onboarding de nuevos integrantes en minutos, no horas
- Deploy consistente en servidores VPS (DigitalOcean, Hostinger, Vultr — los más usados en la región)
- Aislamiento de servicios: base de datos, backend, frontend separados

**Cuándo NO usar Docker:**
- Scripts simples de uso interno
- Proyectos personales pequeños que no van a producción
- Cuando el equipo no está listo para la curva de aprendizaje

## Conceptos clave antes de arrancar

| Concepto | Qué es |
|----------|--------|
| **Imagen** | Plantilla inmutable. El "molde" del contenedor |
| **Contenedor** | Instancia en ejecución de una imagen |
| **Dockerfile** | Instrucciones para construir una imagen |
| **Docker Compose** | Herramienta para orquestar múltiples contenedores |
| **Volume** | Persistencia de datos fuera del contenedor |
| **Network** | Red virtual entre contenedores |

## Dockerfile para una API NestJS

Este es el Dockerfile multi-stage que uso en proyectos con NestJS. El multi-stage build reduce el tamaño final de la imagen significativamente.

```dockerfile
# Etapa 1: dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Etapa 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 3: producción (imagen final ligera)
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Correr como usuario no-root (seguridad)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### .dockerignore (siempre incluirlo)

```
node_modules
dist
.env
.env.*
*.log
.git
coverage
```

El `.dockerignore` evita copiar `node_modules` (potencialmente 500MB+) dentro del build context.

## Docker Compose: el verdadero poder

Para proyectos con múltiples servicios (lo más común en proyectos reales), Docker Compose es indispensable. Este es un `docker-compose.yml` para un stack completo con NestJS + PostgreSQL + Redis:

```yaml
version: '3.9'

services:
  api:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

Los `healthcheck` en postgres y redis garantizan que la API no intente conectarse antes de que las bases de datos estén listas.

### Variables de entorno con .env

```bash
# .env.example (este sí va al repo)
DB_NAME=mi_app_db
DB_USER=app_user
DB_PASS=
JWT_SECRET=
```

```bash
# .env (este NO va al repo — en .gitignore)
DB_NAME=mi_app_db
DB_USER=app_user
DB_PASS=super_secure_password_123
JWT_SECRET=mi_jwt_secret_muy_largo
```

## Comandos Docker esenciales

```bash
# Construir y levantar todos los servicios
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f api

# Ver logs de un servicio específico
docker compose logs -f postgres

# Acceder al shell de un contenedor corriendo
docker compose exec api sh
docker compose exec postgres psql -U app_user -d mi_app_db

# Detener sin borrar volúmenes
docker compose stop

# Detener y borrar contenedores (pero no volúmenes)
docker compose down

# Borrar todo incluyendo volúmenes (¡cuidado, borra los datos!)
docker compose down -v

# Ver el estado de los contenedores
docker compose ps
```

## CI/CD con GitHub Actions

Esta es la parte DevOps: automatizar el build, test y deploy con cada push. Aquí un workflow básico para NestJS:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t mi-app:${{ github.sha }} .

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/mi-app
            git pull origin main
            docker compose pull
            docker compose up -d --build
            docker image prune -f
```

Los secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`) se configuran en **Settings → Secrets and variables → Actions** del repositorio en GitHub.

## Buenas prácticas de seguridad con Docker

**1. Nunca correr como root:**
```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

**2. Escanear imágenes con Trivy:**
```bash
# Detecta vulnerabilidades conocidas en la imagen
trivy image mi-app:latest
```

**3. Usar imágenes alpine/slim para minimizar superficie de ataque:**
```dockerfile
FROM node:20-alpine  # ✓ 170MB
# vs
FROM node:20         # ✗ 1.1GB
```

**4. Separar secrets del Dockerfile:**
```bash
# Nunca hardcodear secretos en la imagen
# ✗ Malo:
ENV DB_PASS=mi_password_real

# ✓ Bien: pasar via docker compose o --env-file
docker run --env-file .env mi-app
```

## Monitoreo básico con Docker

```bash
# Ver uso de recursos en tiempo real
docker stats

# Ver uso de disco
docker system df

# Limpiar recursos no usados (imágenes, contenedores parados, caché)
docker system prune -a

# Ver logs con timestamps
docker compose logs -f --timestamps api
```

## Flujo de trabajo en equipo

En mis proyectos, el flujo típico con Docker es:

1. **Dev local**: `docker compose up` levanta todo el stack (API + DB + Redis)
2. **Feature branch**: el desarrollador trabaja en su rama, los tests corren localmente con `npm test`
3. **Pull Request**: GitHub Actions corre el pipeline: lint → test → build → análisis de seguridad
4. **Merge a main**: deploy automático al servidor de staging
5. **Release**: deploy manual a producción con aprobación

Esto garantiza que ningún cambio llega a producción sin pasar por el pipeline completo.

## Conclusión

Docker y DevOps no son solo para grandes empresas: son herramientas accesibles que cualquier desarrollador en Latinoamérica puede adoptar para profesionalizar su flujo de trabajo. Empezar es simple: un `Dockerfile`, un `docker-compose.yml` y un workflow de GitHub Actions básico ya te dan un pipeline production-ready.

El impacto en proyectos reales es inmediato: menos problemas de "funciona en mi máquina", deploys más confiables y equipos más productivos.

Si querés ver estas configuraciones aplicadas en proyectos reales, podés revisar mi [portfolio de proyectos](/#projects) o escribirme por [contacto](/#contact).
