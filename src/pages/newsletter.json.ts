import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Lista pública de entradas publicadas. La usa la función programada
// de la newsletter para detectar entradas nuevas tras cada deploy.
export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const entradas = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((p) => ({
      slug: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate.toISOString(),
    }));
  return new Response(JSON.stringify(entradas), {
    headers: { 'Content-Type': 'application/json' },
  });
};
