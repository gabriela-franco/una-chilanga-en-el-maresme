// Envío de correos con Resend (https://resend.com) usando su API HTTP.

export const REMITENTE =
  process.env.NEWSLETTER_FROM ?? "Una Chilanga en el Maresme <newsletter@unachilangaenelmaresme.com>";

export type Correo = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

const apiKey = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Falta la variable RESEND_API_KEY");
  return key;
};

async function llamarResend(ruta: string, body: unknown) {
  const res = await fetch(`https://api.resend.com${ruta}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
  }
}

export const enviarCorreo = (c: Correo) => llamarResend("/emails", { from: REMITENTE, ...c });

// Resend admite hasta 100 correos por llamada en /emails/batch.
export async function enviarLote(correos: Correo[]) {
  for (let i = 0; i < correos.length; i += 100) {
    await llamarResend(
      "/emails/batch",
      correos.slice(i, i + 100).map((c) => ({ from: REMITENTE, ...c })),
    );
  }
}

export const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

// Plantilla HTML sencilla con la paleta pastel del blog.
export function plantilla(contenido: string, pie = "") {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#fffaf4;font-family:Helvetica,Arial,sans-serif;color:#4a3b47">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-family:Georgia,serif;font-size:20px;font-weight:bold;margin:0 0 20px">🌸 Una Chilanga en el Maresme</p>
<div style="background:#ffffff;border-radius:22px;padding:28px;line-height:1.6">${contenido}</div>
<p style="font-size:12px;color:#776873;text-align:center;margin-top:20px">${pie}</p>
</div></body></html>`;
}

export const botonHtml = (href: string, texto: string) =>
  `<p style="text-align:center;margin:24px 0"><a href="${escapar(href)}" style="background:#f4b6c2;color:#ffffff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:bold">${escapar(texto)}</a></p>`;
