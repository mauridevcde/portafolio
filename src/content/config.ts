import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(50).max(200),
    keywords: z.string(),
    tag: z.string(),
    tagSlug: z.string(),
    publishedDate: z.coerce.date(),
    ogImage: z.string().default('/assets/mauriciogonzalezpicture.png'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog: blogCollection };
