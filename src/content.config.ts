import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum([
      'duelo',
      'migracion',
      'maternidad',
      'salud-emocional',
      'viajes',
      'cocina',
      'un-rato-conmigo',
    ]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const comunidad = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/comunidad' }),
  schema: z.object({
    nombre: z.string(),
    queHace: z.string(),
    enlace: z.string().url().optional(),
    mensaje: z.string(),
    pubDate: z.coerce.date(),
    // true por defecto: solo se publica cuando tú lo revisas y lo pasas a false
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog, comunidad };
