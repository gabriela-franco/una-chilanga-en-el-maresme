import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { comentarios } from "../../db/schema.js";

const SLUG_RE = /^[a-z0-9-]{1,120}$/;
const MAX_NOMBRE = 60;
const MAX_MENSAJE = 2000;

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request) => {
  if (req.method === "GET") {
    const slug = new URL(req.url).searchParams.get("slug") ?? "";
    if (!SLUG_RE.test(slug)) return json({ error: "Entrada no válida." }, 400);

    const filas = await db
      .select({
        id: comentarios.id,
        nombre: comentarios.nombre,
        mensaje: comentarios.mensaje,
        createdAt: comentarios.createdAt,
      })
      .from(comentarios)
      .where(eq(comentarios.postSlug, slug))
      .orderBy(asc(comentarios.createdAt));

    return json(filas);
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Petición no válida." }, 400);
    }

    // Honeypot: los bots suelen rellenar todos los campos.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true }, 201);
    }

    const slug = typeof body.slug === "string" ? body.slug : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const mensaje = typeof body.mensaje === "string" ? body.mensaje.trim() : "";

    if (!SLUG_RE.test(slug)) return json({ error: "Entrada no válida." }, 400);
    if (!nombre || nombre.length > MAX_NOMBRE)
      return json({ error: `Escribe tu nombre (máximo ${MAX_NOMBRE} caracteres).` }, 400);
    if (!mensaje || mensaje.length > MAX_MENSAJE)
      return json({ error: `Escribe tu comentario (máximo ${MAX_MENSAJE} caracteres).` }, 400);

    const [nuevo] = await db
      .insert(comentarios)
      .values({ postSlug: slug, nombre, mensaje })
      .returning({
        id: comentarios.id,
        nombre: comentarios.nombre,
        mensaje: comentarios.mensaje,
        createdAt: comentarios.createdAt,
      });

    return json(nuevo, 201);
  }

  return json({ error: "Método no permitido." }, 405);
};

export const config: Config = {
  path: "/api/comentarios",
};
