#!/usr/bin/env node
// Genera 1 artículo de blog diario usando Groq API y actualiza blog/index.html + sitemap.xml

const fs = require('fs');
const path = require('path');
const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const BASE_URL = 'https://mauridevcde.pro';
const ROOT = path.join(__dirname, '..');

if (!GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY no está definida.');
  process.exit(1);
}

// Rotación de temas — ciclo de 8 días
const TOPICS = [
  {
    tag: 'NestJS · TypeScript',
    theme: 'NestJS con TypeScript',
    extraKeywords: 'nestjs typescript, api rest nestjs, backend typescript latam',
  },
  {
    tag: 'React · Next.js',
    theme: 'React y Next.js',
    extraKeywords: 'react nextjs, componentes react, nextjs app router latam',
  },
  {
    tag: 'Flutter · Dart',
    theme: 'Flutter y Dart para apps móviles',
    extraKeywords: 'flutter tutorial, flutter dart, app movil flutter latam',
  },
  {
    tag: 'DevOps · Docker',
    theme: 'Docker y DevOps para developers',
    extraKeywords: 'docker tutorial, devops latam, contenedores docker',
  },
  {
    tag: 'Bases de datos',
    theme: 'PostgreSQL y bases de datos relacionales',
    extraKeywords: 'postgresql tutorial, bases de datos latam, sql avanzado',
  },
  {
    tag: 'TypeScript',
    theme: 'TypeScript avanzado — patrones y técnicas',
    extraKeywords: 'typescript tips, typescript avanzado, tipos typescript',
  },
  {
    tag: 'Comparativa · Herramientas',
    theme: 'comparativa de herramientas y frameworks tech',
    extraKeywords: 'comparativa frameworks, herramientas dev latam, elegir framework',
  },
  {
    tag: 'LatAm · Carrera dev',
    theme: 'carrera tech y trabajo remoto en Latinoamérica',
    extraKeywords: 'trabajo remoto latam, desarrollador remoto, carrera dev paraguay',
  },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getTodayTopic() {
  return TOPICS[getDayOfYear() % TOPICS.length];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTodayFormatted() {
  const d = new Date();
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function sanitizeSlug(slug) {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function uniqueSlug(slug) {
  let candidate = slug;
  let i = 2;
  while (fs.existsSync(path.join(ROOT, 'blog', `${candidate}.html`))) {
    candidate = `${slug}-${i++}`;
  }
  return candidate;
}

function groqRequest(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error(`Respuesta inválida de Groq: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout en llamada a Groq')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildPrompt(topic) {
  return `Eres un experto desarrollador Full Stack y escritor técnico. Tu audiencia son desarrolladores de Latinoamérica (Argentina, Chile, México, Paraguay).

Escribe un artículo de blog técnico en ESPAÑOL sobre: ${topic.theme}

REGLAS:
- Artículo útil y práctico, con ejemplos de código reales cuando aplique
- Keyword principal debe aparecer en el título y en los primeros 100 palabras
- Mínimo 4 secciones con contenido H2
- Tono profesional pero cercano (como un colega explicando)
- El contenido de cada sección puede incluir HTML: <p>, <ul><li>, <pre><code>, <strong>, <a>
- NO uses em dashes (—) ni frases genéricas de IA
- Keywords adicionales a incluir naturalmente: ${topic.extraKeywords}

Responde ÚNICAMENTE con JSON válido con esta estructura exacta:
{
  "title": "Título atractivo y con keyword SEO, máximo 70 caracteres",
  "slug": "titulo-en-kebab-case-sin-acentos-ni-espacios",
  "metaDescription": "Descripción SEO de 140-155 caracteres con keyword principal y llamada a la acción",
  "keywords": "5 a 8 keywords separadas por coma, relevantes para el artículo",
  "intro": "Párrafo introductorio en HTML puro (1-2 oraciones, sin etiqueta <p> wrapper)",
  "sections": [
    {
      "heading": "Título de sección H2 con keyword",
      "content": "Contenido HTML completo de la sección. Puede tener múltiples <p>, listas <ul><li>, bloques <pre><code>. Usa <strong> para énfasis."
    }
  ],
  "conclusion": "Párrafo de conclusión en HTML puro (sin <p> wrapper)"
}`;
}

function escapeHtml(str) {
  return str.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');
}

function buildArticleHtml(data, slug, topic) {
  const today = getToday();
  const todayFormatted = getTodayFormatted();
  const url = `${BASE_URL}/blog/${slug}.html`;

  const sectionsHtml = data.sections
    .map((s) => `
            <h2>${escapeHtml(s.heading)}</h2>
            ${s.content}`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow" />

    <title>${escapeHtml(data.title)} | Mauricio González Dev</title>
    <meta name="description" content="${escapeHtml(data.metaDescription)}" />
    <meta name="keywords" content="${escapeHtml(data.keywords)}" />
    <meta name="author" content="Mauricio González" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(data.title)}" />
    <meta property="og:description" content="${escapeHtml(data.metaDescription)}" />
    <meta property="og:image" content="${BASE_URL}/assets/mauriciogonzalezpicture.png" />
    <meta property="og:locale" content="es_PY" />
    <meta property="article:author" content="Mauricio González" />
    <meta property="article:published_time" content="${today}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(data.title)}" />
    <meta name="twitter:description" content="${escapeHtml(data.metaDescription)}" />

    <!-- JSON-LD Article -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": ${JSON.stringify(data.title)},
      "description": ${JSON.stringify(data.metaDescription)},
      "author": {
        "@type": "Person",
        "name": "Mauricio González",
        "url": "${BASE_URL}"
      },
      "publisher": {
        "@type": "Person",
        "name": "Mauricio González",
        "url": "${BASE_URL}"
      },
      "datePublished": "${today}",
      "dateModified": "${today}",
      "url": "${url}",
      "inLanguage": "es"
    }
    <\/script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" />

    <!-- Font Awesome -->
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="../enhancements.css" />
    <link rel="stylesheet" href="blog.css" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563eb'/><text x='50' y='68' font-family='Arial' font-size='52' font-weight='bold' fill='white' text-anchor='middle'>MG</text></svg>" />
    <meta name="theme-color" content="#2563eb" />
  </head>
  <body>
    <div class="reading-progress" id="readingProgress"></div>
    <button id="darkModeToggle" aria-label="Toggle dark mode">
      <i class="fas fa-moon"></i>
      <i class="fas fa-sun"></i>
    </button>
    <header class="header">
      <div class="container">
        <a href="../" class="logo">MG</a>
        <nav class="navbar">
          <ul>
            <li><a href="../#about">Sobre mí</a></li>
            <li><a href="../#projects">Proyectos</a></li>
            <li><a href="../#services">Servicios</a></li>
            <li><a href="../blog/" class="active">Blog</a></li>
            <li><a href="../#contact">Contacto</a></li>
          </ul>
        </nav>
        <button class="menu-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main>
      <article class="blog-post">
        <div class="container blog-post-container">
          <header class="blog-post-header">
            <div class="blog-post-meta">
              <span class="blog-tag">${escapeHtml(topic.tag)}</span>
              <time datetime="${today}">${todayFormatted}</time>
              <span class="blog-author">por <a href="../">Mauricio González</a></span>
            </div>
            <h1>${escapeHtml(data.title)}</h1>
            <p class="blog-post-intro">${data.intro}</p>
          </header>

          <div class="blog-post-content">
            ${sectionsHtml}
          </div>

          <footer class="blog-post-footer">
            <p>¿Preguntas o sugerencias? <a href="../#contact">Escribime</a> o encontrame en <a href="https://www.linkedin.com/in/ing-mauricio-gonzalez" target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>
            <a href="../blog/" class="btn btn-secondary">← Volver al blog</a>
          </footer>
        </div>
      </article>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">MG</div>
          <div class="footer-info">
            <span><strong>Mauricio González</strong></span>
            <span>Full Stack Developer</span>
            <span>mauridevcde@gmail.com</span>
          </div>
          <div class="footer-social">
            <a href="https://github.com/mauridevcde" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/ing-mauricio-gonzalez" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>
            <a href="mailto:mauridevcde@gmail.com"><i class="fas fa-envelope"></i></a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; <span id="year"></span> Mauricio González. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>

    <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
    <script src="../script.js" defer></script>
    <script>
      window.addEventListener('scroll', () => {
        const doc = document.documentElement;
        const progress = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
        document.getElementById('readingProgress').style.width = progress + '%';
      });
    </script>
  </body>
</html>
`;
}

function updateBlogIndex(slug, data, topic) {
  const indexPath = path.join(ROOT, 'blog', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const today = getToday();
  const todayFormatted = getTodayFormatted();

  const newCard = `
            <article class="blog-article-card">
              <div class="blog-article-meta">
                <span class="blog-tag">${escapeHtml(topic.tag)}</span>
                <time datetime="${today}">${todayFormatted}</time>
              </div>
              <h2><a href="${slug}.html">${escapeHtml(data.title)}</a></h2>
              <p>${escapeHtml(data.metaDescription)}</p>
              <a href="${slug}.html" class="blog-read-more">Leer artículo →</a>
            </article>`;

  // Inserta al inicio del grid de artículos
  html = html.replace(
    /(<div class="blog-articles-grid">)/,
    `$1\n${newCard}`
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('blog/index.html actualizado');
}

function updateSitemap(slug) {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const today = getToday();

  const newUrl = `  <url>
    <loc>${BASE_URL}/blog/${slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  // Inserta antes del cierre </urlset>
  xml = xml.replace('</urlset>', `${newUrl}\n</urlset>`);
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('sitemap.xml actualizado');
}

async function main() {
  const topic = getTodayTopic();
  console.log(`Tema del día: ${topic.theme}`);

  const prompt = buildPrompt(topic);

  console.log('Llamando a Groq API...');
  const rawResponse = await groqRequest(prompt);

  let data;
  try {
    data = JSON.parse(rawResponse);
  } catch {
    throw new Error(`JSON inválido de Groq: ${rawResponse.substring(0, 300)}`);
  }

  // Validación mínima
  const required = ['title', 'slug', 'metaDescription', 'keywords', 'intro', 'sections', 'conclusion'];
  for (const field of required) {
    if (!data[field]) throw new Error(`Campo faltante en respuesta: ${field}`);
  }
  if (!Array.isArray(data.sections) || data.sections.length < 2) {
    throw new Error('Se esperaban al menos 2 secciones');
  }

  // Añadir conclusión como última sección si no está
  if (data.conclusion) {
    data.sections.push({ heading: 'Conclusión', content: `<p>${data.conclusion}</p>` });
  }

  const slug = uniqueSlug(sanitizeSlug(data.slug));
  console.log(`Slug: ${slug}`);

  const articleHtml = buildArticleHtml(data, slug, topic);
  const articlePath = path.join(ROOT, 'blog', `${slug}.html`);
  fs.writeFileSync(articlePath, articleHtml, 'utf8');
  console.log(`Artículo generado: blog/${slug}.html`);

  updateBlogIndex(slug, data, topic);
  updateSitemap(slug);

  console.log('Listo.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
