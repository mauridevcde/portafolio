export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  tags: string[];
  links: {
    github?: string;
    demo?: string;
  };
  gradient: string;
  status: 'live' | 'dev';
  images?: string[];
}

export const projects: Project[] = [
  {
    slug: 'educconnect',
    title: 'EducConnect',
    category: 'FullStack',
    description:
      'Plataforma SaaS multi-tenant para gestión escolar que conecta estudiantes, docentes y padres con herramientas de seguimiento académico en tiempo real.',
    longDescription:
      'EducConnect es una plataforma SaaS multi-tenant diseñada para instituciones educativas de Latinoamérica. Implementé una arquitectura de base de datos por tenant que permite a cada colegio gestionar sus propios datos de forma aislada y segura. El sistema incluye autenticación robusta con JWT, gestión académica completa (matrículas, calificaciones por bimestres), boletines automáticos en PDF, comunicados con confirmación de lectura en tiempo real mediante WebSockets, y notificaciones push a través de Firebase. Desplegué la solución en producción con Docker, Nginx y CI/CD automatizado.',
    tags: ['NestJS', 'PostgreSQL', 'Redis', 'Next.js', 'Flutter', 'Socket.io', 'Firebase', 'TypeScript'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #A0522D 0%, #C5B08D 100%)',
    status: 'dev',
    images: [
      '/assets/proyectos/Educconect/1.webp',
      '/assets/proyectos/Educconect/2.webp',
      '/assets/proyectos/Educconect/3.webp',
      '/assets/proyectos/Educconect/4.webp',
      '/assets/proyectos/Educconect/5.webp',
      '/assets/proyectos/Educconect/6.webp',
      '/assets/proyectos/Educconect/7.webp',
      '/assets/proyectos/Educconect/8.webp',
      '/assets/proyectos/Educconect/9.webp',
      '/assets/proyectos/Educconect/11.webp',
      '/assets/proyectos/Educconect/12.webp',
      '/assets/proyectos/Educconect/13.webp',
      '/assets/proyectos/Educconect/14.webp',
      '/assets/proyectos/Educconect/15.webp',
      '/assets/proyectos/Educconect/16.webp',
      '/assets/proyectos/Educconect/17.webp',
      '/assets/proyectos/Educconect/18.webp',
      '/assets/proyectos/Educconect/19.webp',
      '/assets/proyectos/Educconect/20.webp',
      '/assets/proyectos/Educconect/21.webp',
      '/assets/proyectos/Educconect/22.webp',
      '/assets/proyectos/Educconect/23.webp',
      '/assets/proyectos/Educconect/24.webp',
      '/assets/proyectos/Educconect/25.webp',
      '/assets/proyectos/Educconect/26.webp',
      '/assets/proyectos/Educconect/27.webp',
      '/assets/proyectos/Educconect/28.webp',
      '/assets/proyectos/Educconect/29.webp',
      '/assets/proyectos/Educconect/30.webp',
      '/assets/proyectos/Educconect/31.webp',
    ],
  },
  {
    slug: 'pos',
    title: 'Sistema POS',
    category: 'FullStack',
    description:
      'Sistema de punto de venta con gestión de inventario, facturación electrónica y reportes en tiempo real para comercios.',
    longDescription:
      'Desarrollé un sistema POS completo para la gestión de comercios pequeños y medianos. El sistema maneja múltiples cajas con Roles de usuario diferenciados (admin, cajero, supervisor), inventario en tiempo real con alertas de stock bajo, proceso de ventas optimizado con búsqueda rápida de productos, generación automática de facturas electrónicas, y dashboard de reportes con métricas de rendimiento. La arquitectura permite escalar horizontalmente para múltiples puntos de venta.',
    tags: ['Vue.js', 'Express', 'MySQL', 'TypeScript', 'Socket.io'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #1A2B24 0%, #A0522D 100%)',
    status: 'dev',
    images: [],
  },
  {
    slug: 'nexustelecom',
    title: 'NexusTelecom',
    category: 'Backend',
    description:
      'Plataforma integral de gestión operacional para una empresa real de telecomunicaciones en Argentina. En producción y en uso diario.',
    longDescription:
      'NexusTelecom es un proyecto real actualmente en producción, utilizado a diario por una empresa de telecomunicaciones en Argentina. La plataforma backend robusta fue desarrollada como monorepo con Turborepo. Implementé un sistema de facturación automática que genera facturas mensuales el día 1 de cada mes mediante jobs cron, gestión completa de clientes con asignación geográfica (provincias y ciudades), control de equipos en campo con tracking de estado, billetera de deuda por cliente con historial de transacciones completo, y reportes financieros en tiempo real con visualizaciones. La autenticación utiliza Firebase Identity junto con JWT Bearer para una capa de seguridad dual. Toda la API está documentada con Swagger/OpenAPI.',
    tags: ['NestJS', 'MySQL', 'TypeORM', 'Firebase', 'Next.js', 'JWT', 'Turborepo', 'Docker'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #C5B08D 0%, #1A2B24 100%)',
    status: 'live',
    images: [
      '/assets/proyectos/nexusTelecom/1.webp',
      '/assets/proyectos/nexusTelecom/2.webp',
      '/assets/proyectos/nexusTelecom/3.webp',
      '/assets/proyectos/nexusTelecom/4.webp',
      '/assets/proyectos/nexusTelecom/5.webp',
      '/assets/proyectos/nexusTelecom/6.webp',
      '/assets/proyectos/nexusTelecom/7.webp',
      '/assets/proyectos/nexusTelecom/8.webp',
      '/assets/proyectos/nexusTelecom/10.webp',
      '/assets/proyectos/nexusTelecom/11.webp',
      '/assets/proyectos/nexusTelecom/12.webp',
      '/assets/proyectos/nexusTelecom/13.webp',
      '/assets/proyectos/nexusTelecom/14.webp',
      '/assets/proyectos/nexusTelecom/15.webp',
      '/assets/proyectos/nexusTelecom/16.webp',
      '/assets/proyectos/nexusTelecom/17.webp',
      '/assets/proyectos/nexusTelecom/18.webp',
      '/assets/proyectos/nexusTelecom/19.webp',
    ],
  },
  {
    slug: 'generador-videos',
    title: 'Video Generator',
    category: 'AI / FullStack',
    description:
      'Herramienta de generación automática de videos cortos con IA: texto a video, narración sintética y subtítulos automáticos.',
    longDescription:
      'Desarrollé una herramienta de generación automática de videos cortos impulsada por inteligencia artificial. El sistema convierte texto en videos con narración sintética utilizando tecnologías de voz de OpenAI, aplica efectos visuales automáticamente, y genera subtítulos sincronizados. Ideal para creadores de contenido que necesitan producir videos rápidos para redes sociales. La arquitectura usa FastAPI para el backend, FFmpeg para el procesamiento de video, y cola de tareas asíncronas para manejar múltiples generaciones simultáneas.',
    tags: ['Python', 'OpenAI', 'FFmpeg', 'FastAPI', 'AI', 'Video Processing'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #A0522D 0%, #1A2B24 100%)',
    status: 'dev',
    images: [],
  },
];
