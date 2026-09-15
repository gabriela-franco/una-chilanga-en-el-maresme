# 🌸 Una Chilanga en el Maresme

Blog personal construido con [Astro](https://astro.build), con diseño floral en tonos
pastel (rosa, lila, verde menta). Escribe los posts en Markdown y publica gratis en Netlify.

## Estructura del proyecto

```
src/
  components/     Header, Footer, tarjetas de post, flor decorativa (SVG)
  content/blog/    Aquí van tus posts en Markdown
  content.config.ts  Define los campos que debe tener cada post
  layouts/         Plantilla base (fuentes, header, footer)
  pages/           index (home), blog (listado + filtros)
public/            Favicon y archivos estáticos
```

## Cómo escribir un nuevo post

1. Crea un archivo `.md` dentro de `src/content/blog/`, por ejemplo `mi-nuevo-post.md`.
2. Copia este encabezado (frontmatter) y complétalo:

   ```md
   ---
   title: "Título del post"
   description: "Resumen corto para las tarjetas y el SEO"
   pubDate: 2026-09-14
   category: "duelo" # duelo | migracion | maternidad | salud-emocional | viajes | cocina | un-rato-conmigo
   tags: ["etiqueta1", "etiqueta2"]
   draft: false
   ---
   ```
3. Debajo del segundo `---`, escribe el post en Markdown normal (títulos con `##`, listas con `-`, etc).
4. Mientras `draft: true`, el post NO aparece publicado. Cámbialo a `false` cuando esté listo.

Ya hay 7 posts de ejemplo en `src/content/blog/` (todos con `draft: true`) para que edites
el texto con tu historia real y los publiques cuando quieras.

## Ver el blog en tu computadora

```sh
npm install       # solo la primera vez
npm run dev       # abre http://localhost:4321
```

Cada cambio que guardes se refleja al instante en el navegador.

## Publicar el blog en internet (Netlify, gratis)

**Opción A — con Git (recomendada, permite seguir editando fácil):**

1. Sube este proyecto a un repositorio de GitHub (crea uno nuevo en github.com y sigue
   las instrucciones de "push an existing repository").
2. Entra a [netlify.com](https://www.netlify.com) y crea una cuenta gratuita.
3. Click en **"Add new site" → "Import an existing project"** y conecta tu cuenta de GitHub.
4. Elige el repositorio del blog. Netlify detecta Astro automáticamente
   (build command: `npm run build`, publish directory: `dist`).
5. Click en **Deploy**. En 1-2 minutos tu blog está en línea con una URL tipo
   `nombre-al-azar.netlify.app`.
6. Cada vez que hagas `git push`, Netlify vuelve a publicar el sitio solo.

**Opción B — arrastrar y soltar (más rápida, sin actualizaciones automáticas):**

1. Corre `npm run build` en tu computadora. Esto genera la carpeta `dist/`.
2. Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta `dist/`.
3. Netlify publica el sitio al instante con una URL `nombre-al-azar.netlify.app`.

## Conectar tu propio dominio

Si compras un dominio (por ejemplo `unachilangaenelmaresme.com`, que está disponible),
en Netlify ve a **Site settings → Domain management → Add a domain** y sigue las
instrucciones para apuntar los DNS. Netlify da un certificado HTTPS gratis automáticamente.

## Personalizar colores y fuentes

Todo el diseño (colores, tipografías, tarjetas, botones) vive en un solo archivo:
`src/styles/global.css`, en la sección `:root` al principio. Cambia los valores de
`--rosa`, `--lila`, `--menta` para ajustar la paleta.
