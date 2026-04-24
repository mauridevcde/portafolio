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
  },
];
