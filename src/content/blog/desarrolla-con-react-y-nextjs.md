---
title: "Desarrolla con React y Next.js: Guía Práctica para Latinoamérica"
description: "Aprende a crear aplicaciones web escalables con React y Next.js. Descubre cómo mejorar la experiencia del usuario con componentes React y Nextjs app router para desarrolladores de Latinoamérica."
keywords: "react, nextjs, componentes react, nextjs app router, latinoamérica, desarrollo web, react hooks, nextjs tutorial"
tag: "React · Next.js"
tagSlug: "react"
publishedDate: 2026-04-23
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

React y Next.js son el stack frontend más demandado en Latinoamérica hoy. Dominarlos abre puertas a proyectos remotos con empresas de toda la región y el mundo. En este artículo voy a mostrarte cómo construir una aplicación web moderna y escalable, con las prácticas que uso en proyectos reales.

## ¿Por qué React + Next.js?

**React** por sí solo es una biblioteca UI: maneja el render de componentes y el estado local. **Next.js** agrega encima todo lo que React no tiene por defecto:

- Server-Side Rendering (SSR) para SEO y performance
- Static Site Generation (SSG) para páginas que no cambian
- File-based routing (sin configurar react-router manualmente)
- Image Optimization integrada
- API Routes para endpoints simples
- Optimizaciones de performance automáticas

Juntos forman uno de los stacks más completos y productivos para aplicaciones web en 2025.

## Crear el proyecto

```bash
# Crear con create-next-app (configuración guiada)
npx create-next-app@latest mi-app --typescript --tailwind --eslint --app

cd mi-app
npm run dev
```

El flag `--app` usa el **App Router** (el nuevo sistema de routing de Next.js 13+). Si preferís el routing anterior más simple, omitilo (usa Pages Router).

## Componentes React en el App Router

Con el App Router, hay dos tipos de componentes que necesitás entender bien:

### Server Components (por defecto)

```tsx
// app/productos/page.tsx
// Este componente corre EN EL SERVIDOR. No puede usar hooks ni eventos.
async function ProductosPage() {
  // Fetch directo desde el servidor, sin useEffect
  const productos = await fetch('https://api.mitienda.com/productos')
    .then(r => r.json());

  return (
    <main>
      <h1>Productos</h1>
      <div className="grid grid-cols-3 gap-4">
        {productos.map(producto => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </main>
  );
}

export default ProductosPage;
```

**Ventaja**: cero JavaScript enviado al cliente para este componente. El HTML llega renderizado.

### Client Components

```tsx
// components/BuscadorProductos.tsx
'use client'; // ← Marca este componente como cliente

import { useState } from 'react';

export function BuscadorProductos({ onBuscar }: { onBuscar: (q: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onBuscar(query)}
      placeholder="Buscar productos..."
      className="border rounded px-4 py-2 w-full"
    />
  );
}
```

**Regla de oro**: usá Client Components solo cuando necesitás interactividad (useState, useEffect, eventos del DOM). Todo lo demás, Server Components.

## Routing con el App Router

El routing es basado en carpetas dentro de `app/`:

```
app/
├── page.tsx              → /
├── layout.tsx            → Layout que envuelve todo
├── productos/
│   ├── page.tsx          → /productos
│   └── [id]/
│       └── page.tsx      → /productos/123
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/mi-articulo
└── api/
    └── webhook/
        └── route.ts      → /api/webhook (API Route)
```

### Layout compartido

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Mi Tienda',
    default: 'Mi Tienda Online',
  },
  description: 'La mejor tienda online de Latinoamérica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Rutas dinámicas con datos

```tsx
// app/productos/[id]/page.tsx
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const producto = await obtenerProducto(params.id);
  return {
    title: producto?.nombre,
    description: producto?.descripcion,
  };
}

export default async function ProductoDetallePage({ params }: Props) {
  const producto = await obtenerProducto(params.id);

  if (!producto) {
    notFound(); // Renderiza la página 404
  }

  return (
    <article>
      <h1>{producto.nombre}</h1>
      <p className="text-2xl font-bold">${producto.precio}</p>
      <p>{producto.descripcion}</p>
    </article>
  );
}

// Pre-renderizar las páginas más visitadas en build time (SSG)
export async function generateStaticParams() {
  const productos = await obtenerProductosDestacados();
  return productos.map(p => ({ id: p.id.toString() }));
}
```

## Hooks esenciales de React

### useState y useEffect

```tsx
'use client';
import { useState, useEffect } from 'react';

function ListaProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => setProductos(data))
      .catch(err => setError(err.message))
      .finally(() => setCargando(false));
  }, []); // Array vacío = ejecutar solo al montar

  if (cargando) return <Spinner />;
  if (error) return <MensajeError mensaje={error} />;

  return (
    <ul>
      {productos.map(p => (
        <li key={p.id}>{p.nombre}</li>
      ))}
    </ul>
  );
}
```

### useCallback y useMemo para optimización

```tsx
'use client';
import { useState, useCallback, useMemo } from 'react';

function CatalogoFiltrable({ productos }: { productos: Producto[] }) {
  const [filtro, setFiltro] = useState('');
  const [ordenar, setOrdenar] = useState<'precio' | 'nombre'>('nombre');

  // useMemo: recalcula solo cuando cambian filtro u ordenar
  const productosFiltrados = useMemo(() => {
    return productos
      .filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => a[ordenar] > b[ordenar] ? 1 : -1);
  }, [productos, filtro, ordenar]);

  // useCallback: función estable que no se recrea en cada render
  const handleFiltro = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltro(e.target.value);
  }, []);

  return (
    <>
      <input onChange={handleFiltro} placeholder="Filtrar..." />
      <p>{productosFiltrados.length} productos</p>
      <ul>
        {productosFiltrados.map(p => <li key={p.id}>{p.nombre}</li>)}
      </ul>
    </>
  );
}
```

## Manejo de formularios con Server Actions

En el App Router podés manejar formularios sin JavaScript del lado del cliente:

```tsx
// app/contacto/page.tsx
import { redirect } from 'next/navigation';

async function enviarContacto(formData: FormData) {
  'use server';
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const mensaje = formData.get('mensaje') as string;

  await enviarEmail({ nombre, email, mensaje });
  redirect('/contacto/gracias');
}

export default function PaginaContacto() {
  return (
    <form action={enviarContacto}>
      <input name="nombre" placeholder="Tu nombre" required />
      <input name="email" type="email" placeholder="Tu email" required />
      <textarea name="mensaje" placeholder="Tu mensaje" required />
      <button type="submit">Enviar</button>
    </form>
  );
}
```

## Optimización de imágenes

Next.js tiene el componente `Image` que optimiza automáticamente:

```tsx
import Image from 'next/image';

function BannerHero() {
  return (
    <Image
      src="/banner.jpg"
      alt="Banner principal de la tienda"
      width={1200}
      height={600}
      priority      // Preload para la imagen above-the-fold
      placeholder="blur"
      className="w-full h-auto"
    />
  );
}
```

Beneficios automáticos:
- Conversión a WebP/AVIF
- Lazy loading por defecto (excepto con `priority`)
- Responsive con `srcset`
- Prevención de layout shift

## Variables de entorno

```bash
# .env.local (no va al repo)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXT_PUBLIC_API_URL=https://api.mitienda.com
```

```typescript
// Las que empiezan con NEXT_PUBLIC_ son accesibles en el cliente
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Las que no, solo en el servidor (Server Components, API Routes)
const dbUrl = process.env.DATABASE_URL;
```

## Deployment en Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Deploy desde tu proyecto local
vercel

# Deploy de producción desde la rama main
vercel --prod
```

O conectar el repo de GitHub directamente en vercel.com — cada push a `main` dispara un deploy automático.

## Conclusión

React y Next.js siguen siendo la combinación más demandada para desarrollo frontend profesional en Latinoamérica. Con el App Router, Next.js logra un balance excelente entre DX (Developer Experience) y performance.

Mi recomendación para aprender: empezá con el Pages Router si sos nuevo en Next.js, luego migrá al App Router una vez que tengas los conceptos básicos de React claros (componentes, hooks, estado). El salto es más fácil si ya entendés bien los fundamentos.

¿Querés ver React y Next.js en proyectos reales? Podés revisar mi [portfolio](/#projects) o escribirme por [contacto](/#contact).
