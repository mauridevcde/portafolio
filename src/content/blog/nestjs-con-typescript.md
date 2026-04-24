---
title: "NestJS con TypeScript: Guía Completa para API REST"
description: "Aprende a crear un backend robusto con NestJS y TypeScript, la combinación perfecta para API REST en Latinoamérica. Descubre cómo empezar con este framework de Node.js."
keywords: "NestJS, TypeScript, API REST, backend, TypeScript Latam, NestJS TypeScript, nestjs tutorial, api rest nestjs"
tag: "NestJS · TypeScript"
tagSlug: "nestjs"
publishedDate: 2026-04-22
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

NestJS y TypeScript son, en mi experiencia, la combinación más productiva para construir APIs backend robustas y mantenibles. Si venís de Express puro, el salto a NestJS puede parecer intimidante al principio por la cantidad de decoradores y conceptos nuevos, pero una vez que entendés la estructura, el desarrollo se vuelve mucho más rápido y predecible.

En este artículo voy a guiarte desde cero hasta una API REST funcional con validación, autenticación y base de datos.

## ¿Por qué NestJS y no Express puro?

Express es flexible, pero esa flexibilidad tiene un costo: cada proyecto termina con una estructura diferente, sin convenciones claras. NestJS resuelve esto con una arquitectura modular y opinionada inspirada en Angular:

| Criterio | Express puro | NestJS |
|----------|-------------|--------|
| Estructura | Libre (depende del dev) | Modular, convencional |
| TypeScript | Se puede agregar | First-class citizen |
| Inyección de dependencias | Manual | Integrada (IoC container) |
| Validación | Manual con libraries | Integrada (class-validator) |
| Testing | Setup manual | Jest integrado con mocks |
| Documentación | Manual | Swagger automático |

Para proyectos que van a escalar o que trabaja un equipo, NestJS gana por lejos. Para un script rápido o una API de 3 endpoints, Express puede ser suficiente.

## Instalación y estructura del proyecto

```bash
# Instalar el CLI global
npm i -g @nestjs/cli

# Crear nuevo proyecto
nest new mi-api

# El CLI pregunta el package manager (npm/yarn/pnpm)
cd mi-api
```

La estructura generada:

```
mi-api/
├── src/
│   ├── app.module.ts       ← Módulo raíz
│   ├── app.controller.ts   ← Controlador por defecto
│   ├── app.service.ts      ← Servicio por defecto
│   └── main.ts             ← Bootstrap de la aplicación
├── test/
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## Arquitectura: módulos, controladores y servicios

NestJS organiza el código en **módulos**. Cada feature del negocio tiene su propio módulo. Generar un módulo completo con el CLI:

```bash
nest generate resource usuarios
# Pregunta si es REST API, GraphQL, etc.
# Genera: módulo, controlador, servicio, DTOs y entidad
```

### Módulo

```typescript
// usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Para que otros módulos puedan inyectarlo
})
export class UsuariosModule {}
```

### Controlador con tipado completo

```typescript
// usuarios/usuarios.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseUUIDPipe,
  HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usuariosService.findAll({ page: +page, limit: +limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.remove(id);
  }
}
```

### Servicio con inyección de dependencias

```typescript
// usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existe = await this.usuarioRepo.findOne({
      where: { email: dto.email }
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const usuario = this.usuarioRepo.create(dto);
    return this.usuarioRepo.save(usuario);
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return usuario;
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const [data, total] = await this.usuarioRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { creadoEn: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
```

## Validación con DTOs y class-validator

Los **DTOs (Data Transfer Objects)** definen la forma de los datos entrantes y los validamos automáticamente:

```bash
npm i class-validator class-transformer
```

```typescript
// usuarios/dto/create-usuario.dto.ts
import {
  IsEmail, IsString, MinLength, MaxLength,
  IsOptional, IsEnum
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mi_contraseña_segura' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['admin', 'usuario'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'usuario'])
  rol?: string;
}
```

Para que la validación funcione automáticamente, habilitar el pipe global en `main.ts`:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación automática de todos los DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Elimina propiedades no declaradas en el DTO
    forbidNonWhitelisted: true, // Error si llegan propiedades extra
    transform: true,       // Transforma tipos automáticamente
  }));

  // CORS para frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  });

  // Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Mi API')
    .setDescription('Documentación de la API REST')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API corriendo en: ${await app.getUrl()}`);
}
bootstrap();
```

## Manejo de errores global

NestJS tiene filtros de excepciones para interceptar errores y formatearlos consistentemente:

```typescript
// filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Error interno del servidor';

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception as Error);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

Registrar el filtro globalmente en `main.ts`:

```typescript
app.useGlobalFilters(new GlobalExceptionFilter());
```

## Variables de entorno con @nestjs/config

```bash
npm i @nestjs/config
```

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // Disponible en todos los módulos sin importar
      envFilePath: '.env',
    }),
    // ...
  ],
})
export class AppModule {}
```

Inyección en servicios:

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MiServicio {
  constructor(private config: ConfigService) {
    const secret = this.config.get<string>('JWT_SECRET');
  }
}
```

## Testing con Jest

NestJS viene con Jest configurado. Ejemplo de test unitario para el servicio:

```typescript
// usuarios/usuarios.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('debe lanzar NotFoundException si el usuario no existe', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('uuid-inexistente'))
      .rejects.toThrow(NotFoundException);
  });
});
```

## Conclusión

NestJS con TypeScript es el stack que uso en todos mis proyectos backend, incluyendo [EducConnect](/#projects) y [NexusTelecom](/#projects). La curva de aprendizaje inicial vale completamente la pena: el código es más mantenible, más testeable y onboardear a nuevos desarrolladores es mucho más rápido porque la estructura es convencional y predecible.

Si venís de Express puro, mi recomendación es hacer el salto. Empezá por un módulo simple, entendé el flujo módulo → controlador → servicio → DTO, y el resto se vuelve natural.

¿Tenés preguntas sobre NestJS o TypeScript? Podés escribirme desde [contacto](/#contact).
