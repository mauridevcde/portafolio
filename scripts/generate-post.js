#!/usr/bin/env node
// Genera 1 artículo de blog diario usando Groq API y escribe src/content/blog/[slug].md

const fs = require('fs');
const path = require('path');
const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const BASE_URL = 'https://mauridevcde.pro';
const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

if (!GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY no está definida.');
  process.exit(1);
}

const TAG_SLUG_MAP = {
  'NestJS · TypeScript': 'nestjs',
  'React · Next.js': 'react',
  'Flutter · Dart': 'flutter',
  'DevOps · Docker': 'devops',
  'Bases de datos': 'typescript',
  'TypeScript': 'typescript',
  'Comparativa · Herramientas': 'typescript',
  'LatAm · Carrera dev': 'devops',
};

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

function getExistingPosts() {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) return null;
      const fm = fmMatch[1];
      const title = (fm.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || '';
      const tag   = (fm.match(/^tag:\s*"?(.+?)"?\s*$/m) || [])[1] || '';
      const date  = (fm.match(/^publishedDate:\s*(.+?)\s*$/m) || [])[1] || '1970-01-01';
      return { title: title.trim(), tag: tag.trim(), date: date.trim() };
    })
    .filter(Boolean);
}

function getTodayTopic(existingPosts) {
  const lastUsed = {};
  for (const post of existingPosts) {
    const idx = TOPICS.findIndex(t => t.tag === post.tag);
    if (idx !== -1) {
      if (!lastUsed[idx] || post.date > lastUsed[idx]) {
        lastUsed[idx] = post.date;
      }
    }
  }
  let chosen = 0;
  for (let i = 1; i < TOPICS.length; i++) {
    const a = lastUsed[i]      || '1970-01-01';
    const b = lastUsed[chosen] || '1970-01-01';
    if (a < b) chosen = i;
  }
  return TOPICS[chosen];
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
  while (fs.existsSync(path.join(BLOG_DIR, `${candidate}.md`))) {
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

function buildPrompt(topic, existingPosts) {
  const avoidBlock = existingPosts.length > 0
    ? `\nTÍTULOS YA PUBLICADOS (NO repitas ni parafrasees ninguno):\n${existingPosts.map(p => `- "${p.title}" [${p.tag}]`).join('\n')}\n\nEl nuevo artículo DEBE tener un ángulo diferente, un subtema específico o un caso de uso concreto que no aparezca en la lista anterior.\n`
    : '';

  return `Eres un experto desarrollador Full Stack y escritor técnico. Tu audiencia son desarrolladores de Latinoamérica (Argentina, Chile, México, Paraguay).
${avoidBlock}
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

function buildArticleMarkdown(data, slug, topic) {
  const today = getToday();
  const tagSlug = TAG_SLUG_MAP[topic.tag] || 'typescript';

  const sectionsContent = data.sections
    .map((s) => `## ${s.heading}\n\n${s.content}\n`)
    .join('\n');

  return `---
title: "${data.title.replace(/"/g, '\\"')}"
description: "${data.metaDescription.replace(/"/g, '\\"')}"
keywords: "${data.keywords.replace(/"/g, '\\"')}"
tag: "${topic.tag}"
tagSlug: "${tagSlug}"
publishedDate: ${today}
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

${data.intro}

${sectionsContent}
`;
}

async function main() {
  const existingPosts = getExistingPosts();
  console.log(`Posts existentes: ${existingPosts.length}`);

  const topic = getTodayTopic(existingPosts);
  console.log(`Tema del día: ${topic.theme}`);

  const prompt = buildPrompt(topic, existingPosts);

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

  const markdownContent = buildArticleMarkdown(data, slug, topic);
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, markdownContent, 'utf8');
  console.log(`Artículo generado: src/content/blog/${slug}.md`);

  console.log('Listo.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
