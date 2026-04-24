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
      '/assets/proyectos/Educconect/1.png',
      '/assets/proyectos/Educconect/2.png',
      '/assets/proyectos/Educconect/3.png',
      '/assets/proyectos/Educconect/4.png',
      '/assets/proyectos/Educconect/5.png',
      '/assets/proyectos/Educconect/6.png',
      '/assets/proyectos/Educconect/7.png',
      '/assets/proyectos/Educconect/8.png',
      '/assets/proyectos/Educconect/9.png',
      '/assets/proyectos/Educconect/11.png',
      '/assets/proyectos/Educconect/12.png',
      '/assets/proyectos/Educconect/13.png',
      '/assets/proyectos/Educconect/14.png',
      '/assets/proyectos/Educconect/15.png',
      '/assets/proyectos/Educconect/16.png',
      '/assets/proyectos/Educconect/17.png',
      '/assets/proyectos/Educconect/18.png',
      '/assets/proyectos/Educconect/19.png',
      '/assets/proyectos/Educconect/20.png',
      '/assets/proyectos/Educconect/21.png',
      '/assets/proyectos/Educconect/22.png',
      '/assets/proyectos/Educconect/23.png',
      '/assets/proyectos/Educconect/24.png',
      '/assets/proyectos/Educconect/25.png',
      '/assets/proyectos/Educconect/26.png',
      '/assets/proyectos/Educconect/27.png',
      '/assets/proyectos/Educconect/28.png',
      '/assets/proyectos/Educconect/29.png',
      '/assets/proyectos/Educconect/30.png',
      '/assets/proyectos/Educconect/31.png',
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
      'Plataforma integral de gestión operacional para empresas de telecomunicaciones: clientes, facturación automática y soporte técnico.',
    longDescription:
      'NexusTelecom es una plataforma backend robusta desarrollada como monorepo con Turborepo para una empresa de telecomunicaciones en Argentina. Implementé un sistema de facturación automática que genera facturas mensuales el día 1 de cada mes mediante jobs cron, gestión completa de clientes con asignación geográfica (provincias y ciudades), control de equipos en campo con tracking de estado, billetera de deuda por cliente con historial de transacciones completo, y reportes financieros en tiempo real con visualizaciones. La autenticación utiliza Firebase Identity junto con JWT Bearer para una capa de seguridad dual. Toda la API está documentada con Swagger/OpenAPI.',
    tags: ['NestJS', 'MySQL', 'TypeORM', 'Firebase', 'Next.js', 'JWT', 'Turborepo', 'Docker'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #C5B08D 0%, #1A2B24 100%)',
    status: 'dev',
    images: [
      '/assets/proyectos/nexusTelecom/1.png',
      '/assets/proyectos/nexusTelecom/2.png',
      '/assets/proyectos/nexusTelecom/3.png',
      '/assets/proyectos/nexusTelecom/4.png',
      '/assets/proyectos/nexusTelecom/5.png',
      '/assets/proyectos/nexusTelecom/6.png',
      '/assets/proyectos/nexusTelecom/7.png',
      '/assets/proyectos/nexusTelecom/8.png',
      '/assets/proyectos/nexusTelecom/10.png',
      '/assets/proyectos/nexusTelecom/11.png',
      '/assets/proyectos/nexusTelecom/12.png',
      '/assets/proyectos/nexusTelecom/13.png',
      '/assets/proyectos/nexusTelecom/14.png',
      '/assets/proyectos/nexusTelecom/15.png',
      '/assets/proyectos/nexusTelecom/16.png',
      '/assets/proyectos/nexusTelecom/17.png',
      '/assets/proyectos/nexusTelecom/18.png',
      '/assets/proyectos/nexusTelecom/19.png',
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
