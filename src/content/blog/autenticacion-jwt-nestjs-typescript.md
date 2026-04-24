---
title: "Autenticación JWT con NestJS y TypeScript"
description: "Guía práctica para implementar autenticación JWT en NestJS con TypeScript. Guards, decoradores personalizados, refresh tokens y control de roles RBAC."
keywords: "jwt nestjs typescript, autenticacion nestjs, guards nestjs, rbac nestjs, refresh token nestjs"
tag: "NestJS · TypeScript"
tagSlug: "nestjs"
publishedDate: 2026-04-22
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

NestJS tiene un sistema de guards y decoradores que hace la autenticación JWT elegante y mantenible. En este artículo implementamos el flujo completo: login, generación de tokens, guards de protección de rutas y control de roles RBAC.

## ¿Por qué JWT en NestJS?

<p>JSON Web Tokens permiten autenticación stateless: el servidor no guarda sesiones. Cada request incluye el token firmado y el servidor lo valida. En NestJS, los <strong>Guards</strong> son el mecanismo nativo para interceptar requests antes de que lleguen al controlador.</p>

## Estructura del módulo de autenticación

<p>La arquitectura que uso en proyectos como el <a href="/#projects">Sistema de Gestión Veterinaria</a>:</p>

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
```

## 1. Instalar dependencias

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

## 2. JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

## 3. Guard de autenticación

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
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

## 4. Decorador @Public()

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## 5. Guard de roles (RBAC)

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

## 6. Uso en controladores

```typescript
@Controller('users')
export class UserController {
  // Ruta pública — no requiere token
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) { ... }

  // Solo ADMIN puede acceder
  @Roles('admin')
  @Get('all')
  findAll() { ... }
}
```

## Registro global de guards

<p>Registrar ambos guards globalmente en <code>app.module.ts</code> para proteger todas las rutas por defecto:</p>

```typescript
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
]
```

## Resultado

<p>Con esta arquitectura, cada ruta está protegida por defecto. Las rutas públicas se marcan explícitamente con <code>@Public()</code> y el acceso por rol se controla con <code>@Roles('admin')</code>. Es el mismo patrón que uso en el backend del <a href="/#projects">Sistema Veterinario</a>.</p>
