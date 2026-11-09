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
