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
      'Plataforma educativa que conecta estudiantes y docentes con herramientas de gestión académica y seguimiento de progreso.',
    longDescription:
      'EducConnect es una plataforma educativa integral que facilita la conexión entre estudiantes y docentes. Incluye gestión de cursos, seguimiento de progreso académico, sistema de calificaciones y comunicación en tiempo real.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'JWT'],
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
      'Sistema de punto de venta con gestión de inventario, facturación electrónica y reportes en tiempo real.',
    longDescription:
      'Sistema POS completo para comercios. Gestiona inventario, procesa ventas, genera facturas y produce reportes de rendimiento en tiempo real. Incluye manejo de múltiples cajas y roles de usuario.',
    tags: ['Vue.js', 'Express', 'MySQL', 'TypeScript'],
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
      'Gestión integral para empresas de telecomunicaciones: clientes, contratos, facturación y soporte técnico.',
    longDescription:
      'NexusTelecom es una plataforma de gestión para proveedores de internet y telecomunicaciones. Administra contratos, facturación mensual automática, tickets de soporte y control de equipos en campo.',
    tags: ['Node.js', 'Express', 'MySQL', 'REST API'],
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
      'Generador automático de videos cortos con IA: texto a video, narración sintética y subtítulos automáticos.',
    longDescription:
      'Herramienta de generación automática de videos cortos utilizando IA. Convierte texto en videos con narración, efectos visuales y subtítulos automáticos. Ideal para creadores de contenido y redes sociales.',
    tags: ['Python', 'OpenAI', 'FFmpeg', 'FastAPI'],
    links: {
      github: '#',
    },
    gradient: 'linear-gradient(135deg, #A0522D 0%, #1A2B24 100%)',
    status: 'dev',
    images: [],
  },
];
