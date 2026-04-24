---
title: "React y Next.js: Construye Apps Web Modernas desde Cero"
description: "Aprende a construir aplicaciones web escalables con React y Next.js. Descubre cómo integrar componentes React con Next.js App Router en Latinoamérica."
keywords: "React, Next.js, componentes React, Nextjs App Router, react nextjs, latam, react desde cero, nextjs desde cero"
tag: "React · Next.js"
tagSlug: "react"
publishedDate: 2026-04-23
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

Si estás empezando en el desarrollo web y querés aprender el stack más demandado en el mercado latinoamericano, React y Next.js son la combinación perfecta. En este artículo vamos a construir una mini aplicación web desde cero, entendiendo cada concepto en el camino.

## ¿Qué es React y por qué aprenderlo?

React es una **biblioteca de JavaScript** creada por Meta (Facebook) para construir interfaces de usuario. Su propuesta central es simple pero poderosa: dividir la UI en **componentes reutilizables** y actualizar eficientemente solo las partes que cambian.

**Por qué React domina el mercado:**
- Es el framework/librería más buscado en ofertas de trabajo en Latinoamérica (2024-2025)
- Comunidad enorme: millones de packages en npm, tutoriales, Stack Overflow
- Se usa en empresas como Netflix, Airbnb, Mercado Libre, Rappi
- Una vez que aprendés React, migrar a React Native (apps móviles) es más fácil

**¿React o Vue o Angular?** Para conseguir trabajo en Latinoamérica: React primero. El ecosistema y la demanda laboral son significativamente mayores.

## Conceptos fundamentales de React

### 1. Componentes

Los componentes son funciones que retornan JSX (HTML-like syntax en JavaScript):

```tsx
// Un componente simple
function Saludo({ nombre }: { nombre: string }) {
  return <h1>Hola, {nombre}!</h1>;
}

// Usarlo
<Saludo nombre="Mauricio" />
// Resultado: <h1>Hola, Mauricio!</h1>
```

Los componentes se componen: uno puede incluir otros, formando el árbol de UI de la app.

### 2. Props: pasar datos hacia abajo

```tsx
interface TarjetaProps {
  titulo: string;
  descripcion: string;
  imagen?: string; // opcional
  onClick: () => void;
}

function TarjetaProducto({ titulo, descripcion, imagen, onClick }: TarjetaProps) {
  return (
    <div className="border rounded-lg p-4 cursor-pointer" onClick={onClick}>
      {imagen && <img src={imagen} alt={titulo} className="w-full h-48 object-cover" />}
      <h3 className="text-xl font-bold mt-2">{titulo}</h3>
      <p className="text-gray-600">{descripcion}</p>
    </div>
  );
}
```

### 3. Estado con useState

```tsx
'use client';
import { useState } from 'react';

function CarritoBoton() {
  const [cantidad, setCantidad] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCantidad(c => Math.max(0, c - 1))}
        className="bg-gray-200 px-3 py-1 rounded"
      >
        −
      </button>
      <span className="text-lg font-medium">{cantidad}</span>
      <button
        onClick={() => setCantidad(c => c + 1)}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        +
      </button>
    </div>
  );
}
```

**Regla importante**: nunca mutés el estado directamente. Siempre usá la función del `useState`:

```tsx
// ✗ MAL
estado.items.push(nuevoItem);
setEstado(estado);

// ✓ BIEN
setEstado(prev => ({
  ...prev,
  items: [...prev.items, nuevoItem],
}));
```

### 4. Efectos con useEffect

```tsx
'use client';
import { useState, useEffect } from 'react';

function ClimaWidget({ ciudad }: { ciudad: string }) {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Se ejecuta cuando el componente monta o cuando cambia "ciudad"
    setCargando(true);
    fetch(`/api/clima?ciudad=${ciudad}`)
      .then(r => r.json())
      .then(data => setClima(data))
      .finally(() => setCargando(false));

    // Cleanup (opcional): cancelar fetch si el componente se desmonta
    return () => {
      // cancelar subscripciones, limpiar timers, etc.
    };
  }, [ciudad]); // Dependencias: re-ejecutar cuando "ciudad" cambia

  if (cargando) return <p>Cargando clima...</p>;
  return <p>Temperatura en {ciudad}: {clima?.temperatura}°C</p>;
}
```

## Hooks personalizados: reutilizar lógica

Los hooks personalizados son funciones que empiezan con `use` y encapsulan lógica reutilizable:

```tsx
// hooks/useApi.ts
import { useState, useEffect } from 'react';

function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  }, [url]);

  return { data, cargando, error };
}

// Usar el hook personalizado
function ListaUsuarios() {
  const { data: usuarios, cargando, error } = useApi<Usuario[]>('/api/usuarios');

  if (cargando) return <Spinner />;
  if (error) return <p>Error: {error}</p>;
  return <ul>{usuarios?.map(u => <li key={u.id}>{u.nombre}</li>)}</ul>;
}
```

## Introducción a Next.js

Next.js agrega lo que React no tiene: routing, SSR, SSG, optimizaciones de producción. Creá un proyecto:

```bash
npx create-next-app@latest mi-app --typescript --eslint
cd mi-app && npm run dev
```

### Sistema de páginas (Pages Router)

El Pages Router es el más simple para empezar:

```
pages/
├── index.tsx         → /
├── sobre-mi.tsx      → /sobre-mi
├── blog/
│   ├── index.tsx     → /blog
│   └── [slug].tsx    → /blog/cualquier-texto
└── api/
    └── contacto.ts   → /api/contacto (endpoint)
```

### Una página completa

```tsx
// pages/index.tsx
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface Props {
  productos: Producto[];
}

const Inicio: NextPage<Props> = ({ productos }) => {
  return (
    <>
      <Head>
        <title>Mi Tienda | Inicio</title>
        <meta name="description" content="Los mejores productos de Latinoamérica" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Bienvenido a Mi Tienda</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productos.map(producto => (
            <Link href={`/productos/${producto.id}`} key={producto.id}>
              <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold">{producto.nombre}</h2>
                <p className="text-green-600 font-bold">${producto.precio}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

// Fetch de datos en el servidor antes de renderizar
export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('https://api.mitienda.com/productos');
  const productos = await res.json();

  return {
    props: { productos },
  };
};

export default Inicio;
```

### Rutas dinámicas

```tsx
// pages/productos/[id].tsx
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  const productos = await obtenerTodosLosProductos();
  return {
    paths: productos.map(p => ({ params: { id: p.id.toString() } })),
    fallback: 'blocking', // Para productos nuevos que no estaban en build time
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const producto = await obtenerProducto(params!.id as string);
  if (!producto) return { notFound: true };

  return {
    props: { producto },
    revalidate: 60, // ISR: re-generar la página cada 60 segundos
  };
};
```

## Estilado con Tailwind CSS

Tailwind es el sistema de estilos más popular con React/Next.js. Viene incluido con `--tailwind` en create-next-app:

```tsx
// Componente con Tailwind
function AlertaBanner({ tipo, mensaje }: { tipo: 'exito' | 'error'; mensaje: string }) {
  const estilos = {
    exito: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${estilos[tipo]}`}>
      <p className="font-medium">{mensaje}</p>
    </div>
  );
}
```

## Patrón de carga: Skeleton Loading

Para mejorar la UX mientras cargan los datos:

```tsx
function SkeletonTarjeta() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="bg-gray-200 h-48 rounded mb-4" />
      <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
      <div className="bg-gray-200 h-4 rounded w-1/2" />
    </div>
  );
}

function ListaProductos() {
  const { data: productos, cargando } = useApi<Producto[]>('/api/productos');

  if (cargando) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonTarjeta key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {productos?.map(p => <TarjetaProducto key={p.id} {...p} />)}
    </div>
  );
}
```

## Errores comunes y cómo evitarlos

**1. Infinito loop en useEffect:**
```tsx
// ✗ MAL: el objeto se recrea en cada render → loop infinito
useEffect(() => { /* ... */ }, [{ id: userId }]);

// ✓ BIEN: usar el valor primitivo directamente
useEffect(() => { /* ... */ }, [userId]);
```

**2. Olvidar el key en listas:**
```tsx
// ✗ MAL: React no puede identificar qué elemento cambió
{items.map(item => <Item {...item} />)}

// ✓ BIEN: key única y estable (preferir ID de la base de datos)
{items.map(item => <Item key={item.id} {...item} />)}
```

**3. Estado inicial asincrónico:**
```tsx
// ✗ MAL: useState no puede recibir una Promise
const [data, setData] = useState(fetchData());

// ✓ BIEN: iniciar con valor vacío y cargar con useEffect
const [data, setData] = useState<Data | null>(null);
useEffect(() => { fetchData().then(setData); }, []);
```

## Conclusión

React y Next.js son una inversión de aprendizaje con enorme retorno para developers en Latinoamérica. Los conceptos son claros: componentes, props, estado, efectos. Una vez que los dominás, podés construir desde una landing page hasta una aplicación compleja.

Mi recomendación para aprender: hacé un proyecto real desde el principio. Una lista de tareas, un blog personal, una tienda simple. Aprender con ejemplos concretos acelera enormemente la comprensión.

Podés ver estos conceptos aplicados en proyectos reales en mi [portfolio](/#projects). Si tenés preguntas, escribime desde [contacto](/#contact).
