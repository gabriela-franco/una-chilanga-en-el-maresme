import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const comentarios = pgTable(
  "comentarios",
  {
    id: serial().primaryKey(),
    postSlug: text("post_slug").notNull(),
    nombre: text().notNull(),
    mensaje: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("comentarios_post_slug_idx").on(t.postSlug, t.createdAt)],
);

export const suscriptores = pgTable("suscriptores", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  // Token secreto para confirmar la suscripción y darse de baja.
  token: text().notNull().unique(),
  confirmadoAt: timestamp("confirmado_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Entradas del blog de las que ya se avisó (o que ya existían al activar la newsletter).
export const entradasNotificadas = pgTable("entradas_notificadas", {
  slug: text().primaryKey(),
  notificadaAt: timestamp("notificada_at", { withTimezone: true }).defaultNow().notNull(),
});
