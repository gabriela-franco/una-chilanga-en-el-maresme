CREATE TABLE "comentarios" (
	"id" serial PRIMARY KEY,
	"post_slug" text NOT NULL,
	"nombre" text NOT NULL,
	"mensaje" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "comentarios_post_slug_idx" ON "comentarios" ("post_slug","created_at");