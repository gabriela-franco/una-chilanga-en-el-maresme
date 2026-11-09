import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { suscriptores } from "../../db/schema.js";
import { botonHtml, enviarCorreo, plantilla } from "../../lib/correo.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_RE = /^[a-f0-9]{48}$/;

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const nuevoToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");

const MENSAJE_OK =
  "¡Gracias! Te he enviado un correo para confirmar tu suscripción. Revisa tu bandeja de entrada (y la de spam, por si acaso).";

async function suscribir(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Petición no válida." }, 400);
  }

  // Honeypot anti-bots.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, mensaje: MENSAJE_OK });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "Escribe un correo electrónico válido." }, 400);
  }

  const [existente] = await db.select().from(suscriptores).where(eq(suscriptores.email, email));

  // Si ya está confirmado no se envía nada, y se responde igual para no revelar quién está suscrito.
  if (existente?.confirmadoAt) return json({ ok: true, mensaje: MENSAJE_OK });

  let token = existente?.token;
  if (!token) {
    token = nuevoToken();
    await db.insert(suscriptores).values({ email, token }).onConflictDoNothing();
    const [fila] = await db
      .select({ token: suscriptores.token })
      .from(suscriptores)
      .where(eq(suscriptores.email, email));
    token = fila.token;
  }

  const origen = new URL(req.url).origin;
  const enlace = `${origen}/api/suscripcion/confirmar?token=${token}`;

  try {
    await enviarCorreo({
      to: email,
      subject: "Confirma tu suscripción a Una Chilanga en el Maresme",
      html: plantilla(
        `<p>¡Hola!</p>
<p>Gracias por querer recibir un aviso cada vez que publique algo nuevo en el blog. Solo falta un paso: confirma tu correo con el botón de abajo.</p>
${botonHtml(enlace, "Confirmar suscripción")}
<p style="font-size:14px;color:#776873">Si no pediste esto, ignora este correo y no recibirás nada más.</p>`,
      ),
      text: `¡Hola!\n\nGracias por querer recibir un aviso cada vez que publique algo nuevo en el blog. Confirma tu suscripción aquí:\n${enlace}\n\nSi no pediste esto, ignora este correo.`,
    });
  } catch (err) {
    console.error("Error enviando confirmación", err);
    return json({ error: "No se pudo enviar el correo de confirmación. Inténtalo más tarde." }, 502);
  }

  return json({ ok: true, mensaje: MENSAJE_OK });
}

async function confirmar(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (!TOKEN_RE.test(token)) return Response.redirect(new URL("/", url), 302);

  const filas = await db
    .update(suscriptores)
    .set({ confirmadoAt: new Date() })
    .where(eq(suscriptores.token, token))
    .returning({ id: suscriptores.id });

  return Response.redirect(new URL(filas.length ? "/newsletter/confirmada" : "/", url), 302);
}

async function baja(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (TOKEN_RE.test(token)) {
    await db.delete(suscriptores).where(eq(suscriptores.token, token));
  }
  // POST = baja con un clic desde el propio cliente de correo (List-Unsubscribe-Post).
  if (req.method === "POST") return new Response(null, { status: 200 });
  return Response.redirect(new URL("/newsletter/baja", url), 302);
}

export default async (req: Request) => {
  const { pathname } = new URL(req.url);

  if (pathname.endsWith("/confirmar") && req.method === "GET") return confirmar(req);
  if (pathname.endsWith("/baja") && (req.method === "GET" || req.method === "POST")) return baja(req);
  if (pathname === "/api/suscripcion" && req.method === "POST") return suscribir(req);

  return json({ error: "Método no permitido." }, 405);
};

export const config: Config = {
  path: ["/api/suscripcion", "/api/suscripcion/confirmar", "/api/suscripcion/baja"],
};
