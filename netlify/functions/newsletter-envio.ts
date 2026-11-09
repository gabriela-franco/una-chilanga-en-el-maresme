import type { Config } from "@netlify/functions";
import { isNotNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { entradasNotificadas, suscriptores } from "../../db/schema.js";
import { botonHtml, enviarLote, escapar, plantilla, type Correo } from "../../lib/correo.js";

type Entrada = { slug: string; title: string; description: string; pubDate: string };

// Cada hora revisa si hay entradas publicadas de las que aún no se haya avisado
// y envía un correo a todas las personas suscritas (confirmadas).
export default async () => {
  const sitio = process.env.URL ?? "https://unachilangaenelmaresme.com";

  const res = await fetch(`${sitio}/newsletter.json`, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) {
    console.error(`No se pudo leer ${sitio}/newsletter.json (${res.status})`);
    return;
  }
  const entradas: Entrada[] = await res.json();

  const yaNotificadas = await db.select({ slug: entradasNotificadas.slug }).from(entradasNotificadas);

  // Primera ejecución: las entradas que ya existían no se anuncian.
  if (yaNotificadas.length === 0) {
    if (entradas.length) {
      await db
        .insert(entradasNotificadas)
        .values(entradas.map((e) => ({ slug: e.slug })))
        .onConflictDoNothing();
    }
    console.log(`Newsletter activada: ${entradas.length} entradas existentes marcadas como avisadas.`);
    return;
  }

  const conocidas = new Set(yaNotificadas.map((e) => e.slug));
  const ahora = Date.now();
  const nuevas = entradas
    .filter((e) => !conocidas.has(e.slug) && new Date(e.pubDate).getTime() <= ahora)
    .sort((a, b) => a.pubDate.localeCompare(b.pubDate));
  if (nuevas.length === 0) return;

  const lectores = await db
    .select({ email: suscriptores.email, token: suscriptores.token })
    .from(suscriptores)
    .where(isNotNull(suscriptores.confirmadoAt));

  for (const entrada of nuevas) {
    // Se reserva la entrada antes de enviar para no avisar dos veces.
    const reservada = await db
      .insert(entradasNotificadas)
      .values({ slug: entrada.slug })
      .onConflictDoNothing()
      .returning({ slug: entradasNotificadas.slug });
    if (reservada.length === 0) continue;

    const enlace = `${sitio}/blog/${entrada.slug}/`;
    const correos: Correo[] = lectores.map((l) => {
      const bajaUrl = `${sitio}/api/suscripcion/baja?token=${l.token}`;
      return {
        to: l.email,
        subject: `Nueva entrada: ${entrada.title}`,
        html: plantilla(
          `<p style="margin-top:0">¡Hola! Acabo de publicar algo nuevo en el blog:</p>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:16px 0 8px">${escapar(entrada.title)}</h1>
<p>${escapar(entrada.description)}</p>
${botonHtml(enlace, "Leer la entrada")}
<p>Con cariño,<br>Gabriela</p>`,
          `Recibes este correo porque te suscribiste en unachilangaenelmaresme.com. <a href="${escapar(bajaUrl)}" style="color:#776873">Darme de baja</a>`,
        ),
        text: `¡Hola! Acabo de publicar algo nuevo en el blog:\n\n${entrada.title}\n${entrada.description}\n\nLéela aquí: ${enlace}\n\nCon cariño,\nGabriela\n\n—\nPara darte de baja: ${bajaUrl}`,
        headers: {
          "List-Unsubscribe": `<${bajaUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    try {
      await enviarLote(correos);
      console.log(`Aviso de "${entrada.slug}" enviado a ${correos.length} personas.`);
    } catch (err) {
      console.error(`Error enviando el aviso de "${entrada.slug}"`, err);
    }
  }
};

export const config: Config = {
  schedule: "@hourly",
};
