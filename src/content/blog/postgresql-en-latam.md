---
title: "PostgreSQL en Latam: Guía Práctica para Desarrolladores"
description: "Aprende a utilizar PostgreSQL en tus proyectos de bases de datos relacionales en Latinoamérica. Descubre cómo aprovechar sus características en un tutorial práctico con ejemplos de código real."
keywords: "PostgreSQL, bases de datos relacionales, postgresql tutorial, sql avanzado, bases de datos latam, postgresql nodejs, postgresql nestjs"
tag: "Bases de datos"
tagSlug: "typescript"
publishedDate: 2026-04-24
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

En el mundo de las bases de datos relacionales, **PostgreSQL** es una de las opciones más populares y potentes disponibles hoy. Con su amplia gama de características y su capacidad para manejar grandes volúmenes de datos, es la elección ideal para proyectos de todo tipo en Latinoamérica. En este artículo voy a mostrarte, paso a paso, cómo aprovechar PostgreSQL al máximo en tus proyectos backend.

## ¿Por qué PostgreSQL y no MySQL?

Una pregunta frecuente entre desarrolladores latinoamericanos es: ¿PostgreSQL o MySQL? Ambas son opciones sólidas, pero PostgreSQL tiene ventajas claras para proyectos moderados a complejos:

- **Tipos de datos avanzados**: JSON/JSONB nativo, arrays, enums, UUID
- **Full-text search** integrado sin plugins externos
- **Window functions** y CTEs (Common Table Expressions) para consultas analíticas
- **Extensiones poderosas**: PostGIS para geolocalización, pg_trgm para búsqueda difusa
- **Transacciones ACID completas** incluyendo DDL transaccional

En proyectos como [EducConnect](/#projects) y [NexusTelecom](/#projects) uso PostgreSQL como base principal precisamente por su soporte a JSON nativo y su manejo robusto de relaciones complejas.

## Instalación y configuración inicial

### En Ubuntu/Debian (el más común en servidores latinoamericanos)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Verificar que el servicio esté corriendo
sudo systemctl status postgresql

# Acceder como superusuario postgres
sudo -u postgres psql
```

### En macOS con Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Crear base de datos y usuario para el proyecto

```sql
-- Dentro de psql
CREATE DATABASE mi_proyecto_db;
CREATE USER mi_usuario WITH PASSWORD 'contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE mi_proyecto_db TO mi_usuario;

-- Conectarse a la nueva base de datos
\c mi_proyecto_db
```

## Diseño de esquema: buenas prácticas

### Tipos de datos clave

```sql
CREATE TABLE usuarios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  metadata    JSONB DEFAULT '{}',
  rol         VARCHAR(20) CHECK (rol IN ('admin', 'usuario', 'moderador')) DEFAULT 'usuario',
  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  activo      BOOLEAN DEFAULT true
);

CREATE TABLE pedidos (
  id          SERIAL PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  estado      VARCHAR(20) DEFAULT 'pendiente',
  items       JSONB NOT NULL DEFAULT '[]',
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);
```

Uso `UUID` para IDs en tablas que se van a exponer en APIs públicas: evita enumeration attacks. Uso `SERIAL` en tablas internas donde performance importa más que seguridad.

### Índices estratégicos

Los índices mal diseñados son la causa #1 de queries lentas en producción.

```sql
-- Índice para búsquedas frecuentes por email
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Índice parcial: solo usuarios activos (mucho más pequeño)
CREATE INDEX idx_usuarios_activos ON usuarios(email) WHERE activo = true;

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_pedidos_items ON pedidos USING GIN(items);

-- Índice compuesto para queries que filtran por usuario Y estado
CREATE INDEX idx_pedidos_usuario_estado ON pedidos(usuario_id, estado);
```

## Consultas SQL avanzadas

### JOIN con filtros complejos

```sql
SELECT
  u.nombre,
  u.email,
  COUNT(p.id) AS total_pedidos,
  COALESCE(SUM(p.total), 0) AS monto_total
FROM usuarios u
LEFT JOIN pedidos p
  ON p.usuario_id = u.id
  AND p.estado != 'cancelado'
  AND p.creado_en >= NOW() - INTERVAL '30 days'
WHERE u.activo = true
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(p.id) > 0
ORDER BY monto_total DESC
LIMIT 10;
```

### Window Functions para reportes

Las window functions son una de las funcionalidades más poderosas de PostgreSQL. Permiten cálculos sobre un conjunto de filas relacionadas sin colapsar el resultado.

```sql
-- Ranking de pedidos por usuario con running total
SELECT
  u.nombre,
  p.total,
  p.creado_en,
  RANK() OVER (PARTITION BY p.usuario_id ORDER BY p.total DESC) AS ranking,
  SUM(p.total) OVER (PARTITION BY p.usuario_id ORDER BY p.creado_en) AS acumulado
FROM pedidos p
JOIN usuarios u ON u.id = p.usuario_id
WHERE p.estado = 'completado';
```

### CTEs (Common Table Expressions)

```sql
WITH usuarios_vip AS (
  SELECT usuario_id, SUM(total) as total_gastado
  FROM pedidos
  WHERE estado = 'completado'
  GROUP BY usuario_id
  HAVING SUM(total) > 10000
),
ultimos_pedidos AS (
  SELECT DISTINCT ON (usuario_id)
    usuario_id, id as pedido_id, total, creado_en
  FROM pedidos
  ORDER BY usuario_id, creado_en DESC
)
SELECT
  u.nombre,
  u.email,
  vip.total_gastado,
  lp.total as ultimo_pedido_monto
FROM usuarios u
JOIN usuarios_vip vip ON vip.usuario_id = u.id
JOIN ultimos_pedidos lp ON lp.usuario_id = u.id;
```

## PostgreSQL con Node.js y TypeORM (NestJS)

En mis proyectos con NestJS uso TypeORM para la capa de datos. La configuración con PostgreSQL es directa:

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Nunca true en producción
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    }),
  ],
})
export class AppModule {}
```

### Entidad TypeORM con relaciones

```typescript
// pedido.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, JoinColumn
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: number;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ type: 'jsonb', default: [] })
  items: Record<string, unknown>[];

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
```

### Repository con query builder

```typescript
// pedido.service.ts
async getPedidosPorUsuario(usuarioId: string, mes: number): Promise<Pedido[]> {
  return this.pedidoRepo
    .createQueryBuilder('pedido')
    .leftJoinAndSelect('pedido.usuario', 'usuario')
    .where('pedido.usuario_id = :usuarioId', { usuarioId })
    .andWhere('EXTRACT(MONTH FROM pedido.creado_en) = :mes', { mes })
    .andWhere('pedido.estado != :estado', { estado: 'cancelado' })
    .orderBy('pedido.creado_en', 'DESC')
    .getMany();
}
```

## Seguridad en PostgreSQL

La seguridad de la base de datos es crítica. Estos son los pasos mínimos que siempre aplico:

```sql
-- Revocar permisos públicos por defecto
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- El usuario de la app solo puede hacer DML, no DDL
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mi_usuario;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO mi_usuario;

-- Asegurarse que los permisos apliquen a tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mi_usuario;
```

### Configurar pg_hba.conf para producción

```
# Denegar acceso desde fuera de localhost por defecto
host    all             all             0.0.0.0/0       scram-sha-256
local   all             postgres                        peer
```

### Contraseñas seguras con variables de entorno

Nunca hardcodees credenciales. En NestJS con ConfigService:

```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    password: config.get<string>('DB_PASS'),
    // ...
  }),
})
```

## Migraciones con TypeORM

Nunca uses `synchronize: true` en producción. Las migraciones son la forma correcta de evolucionar el esquema:

```bash
# Generar migración automáticamente desde cambios en entidades
npx typeorm migration:generate src/migrations/AddEstadoPedido -d src/data-source.ts

# Ejecutar migraciones pendientes
npx typeorm migration:run -d src/data-source.ts

# Revertir última migración
npx typeorm migration:revert -d src/data-source.ts
```

Ejemplo de migración manual:

```typescript
// src/migrations/1714000000000-AddIndexPedidosEstado.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexPedidosEstado1714000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX CONCURRENTLY idx_pedidos_estado ON pedidos(estado) WHERE estado != 'completado'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pedidos_estado`);
  }
}
```

El `CONCURRENTLY` es importante en producción: crea el índice sin bloquear la tabla.

## Optimización de performance

### EXPLAIN ANALYZE: tu mejor amigo

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.nombre, COUNT(p.id)
FROM usuarios u
JOIN pedidos p ON p.usuario_id = u.id
WHERE u.activo = true
GROUP BY u.id;
```

Buscá en el output: `Seq Scan` en tablas grandes es señal de que falta un índice. `Index Scan` es lo que querés ver.

### Connection pooling con PgBouncer

En producción con Node.js, nunca abras una conexión por request. Usá un pool:

```typescript
// Con pg directamente
const pool = new Pool({
  max: 20,          // máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Conclusión

**PostgreSQL** es mi base de datos relacional de cabecera para proyectos en Node.js y NestJS. Su soporte a JSONB, las window functions, las CTEs y su ecosistema de extensiones lo hacen versátil para cualquier tipo de proyecto, desde una startup hasta un sistema empresarial.

Los puntos clave a recordar: usá UUID para IDs expuestos en APIs, diseñá índices estratégicos, nunca uses `synchronize: true` en producción, y aprovechá `EXPLAIN ANALYZE` antes de deployar queries complejas.

Si tenés preguntas sobre la configuración de PostgreSQL con NestJS o TypeORM, podés escribirme desde la sección de [contacto](/#contact).
