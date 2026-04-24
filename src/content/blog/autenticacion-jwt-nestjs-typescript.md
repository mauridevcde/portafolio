---
title: "JWT en NestJS con TypeScript: Guards, RBAC y Refresh Tokens"
description: "Guía práctica para implementar autenticación JWT en NestJS con TypeScript. Guards, decoradores personalizados, refresh tokens y control de roles RBAC."
keywords: "jwt nestjs typescript, autenticacion nestjs, guards nestjs, rbac nestjs, refresh token nestjs, nestjs passport jwt"
tag: "NestJS · TypeScript"
tagSlug: "nestjs"
publishedDate: 2026-04-22
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

La autenticación es uno de los módulos más críticos de cualquier API. Hacerlo mal puede comprometer toda la aplicación. NestJS tiene un sistema de guards y decoradores que hace la autenticación JWT elegante, segura y mantenible. En este artículo implementamos el flujo completo: login, generación de tokens, guards de protección de rutas, control de roles RBAC y refresh tokens.

## ¿Por qué JWT y no sesiones?

JWT (JSON Web Tokens) permite autenticación **stateless**: el servidor no guarda el estado de sesión en memoria ni en base de datos. Cada request incluye el token firmado y el servidor lo valida con la clave secreta.

**Ventajas para APIs:**
- Horizontal scaling sin problemas (cualquier instancia valida el token)
- Perfecto para microservicios y arquitecturas distribuidas
- Sin necesidad de Redis o base de datos para las sesiones

**Desventajas a considerar:**
- Los tokens no se pueden invalidar antes de expirar (requiere implementar blacklist con Redis)
- El payload viaja en cada request (no incluir datos sensibles)

## Estructura del módulo de autenticación

La arquitectura que uso en proyectos como el [Sistema de Gestión Veterinaria](/#projects) y [NexusTelecom](/#projects):

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── usuarios/
│   └── usuarios.module.ts
```

## 1. Instalar dependencias

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

## 2. Configurar el módulo de autenticación

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // Access token corto
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## 3. JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;   // userId
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Este objeto se adjunta a request.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

## 4. Guard de autenticación con soporte a rutas públicas

```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Si la ruta está marcada como @Public(), no validar token
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

## 5. Decoradores personalizados

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// auth/decorators/usuario-actual.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UsuarioActual = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

## 6. Guard de roles (RBAC)

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, cualquier usuario autenticado puede acceder
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Se requiere rol: ${requiredRoles.join(' o ')}`
      );
    }
    return true;
  }
}
```

## 7. AuthService con hashing y refresh tokens

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string, nombre: string) {
    const existe = await this.usuariosService.findByEmail(email);
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(password, 12);
    const usuario = await this.usuariosService.create({
      email,
      password: hash,
      nombre,
    });

    return this.generarTokens(usuario);
  }

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) throw new UnauthorizedException('Credenciales inválidas');

    return this.generarTokens(usuario);
  }

  private generarTokens(usuario: { id: string; email: string; role: string }) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const usuario = await this.usuariosService.findById(payload.sub);
      if (!usuario) throw new UnauthorizedException();

      return this.generarTokens(usuario);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
```

## 8. AuthController

```typescript
// auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.nombre);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
```

## 9. Uso en controladores de negocio

```typescript
@Controller('usuarios')
export class UsuariosController {
  // Ruta pública — no requiere token
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) { ... }

  // Requiere autenticación (por defecto, sin @Public())
  @Get('perfil')
  getPerfil(@UsuarioActual() user: UsuarioJwt) {
    return this.usuariosService.findById(user.userId);
  }

  // Solo ADMIN puede acceder
  @Roles('admin')
  @Get()
  findAll() { ... }

  // Admin o moderador
  @Roles('admin', 'moderador')
  @Delete(':id')
  remove(@Param('id') id: string) { ... }
}
```

## 10. Registro global de guards en AppModule

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  providers: [
    // Protege TODAS las rutas por defecto
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Controla acceso por rol donde se use @Roles()
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

## Buenas prácticas de seguridad

**1. Usar HTTPS siempre en producción.** Los tokens en HTTP plano son vulnerables a MITM.

**2. Configurar expiración corta para access tokens (15 min) y larga para refresh tokens (7 días).**

**3. Almacenar refresh tokens en httpOnly cookies desde el frontend:**

```typescript
// Si el frontend es Next.js en el mismo servidor
res.cookie('refreshToken', tokens.refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**4. Nunca incluir datos sensibles en el payload del JWT** (contraseñas, números de tarjeta, etc.).

**5. Rotar la clave secreta periódicamente** — o si hay sospecha de compromiso.

## Resultado final

Con esta arquitectura, cada ruta está protegida por defecto. Las rutas públicas se marcan explícitamente con `@Public()` y el acceso por rol se controla con `@Roles('admin')`. Es el mismo patrón que uso en el backend del [Sistema Veterinario](/#projects) y en [NexusTelecom](/#projects).

La ventaja de este enfoque es clara: si olvidás poner `@Public()` en una ruta, queda protegida automáticamente. El default seguro evita errores de configuración que exponen rutas sin querer.

¿Tenés preguntas sobre la implementación de autenticación en NestJS? Escribime desde [contacto](/#contact).
