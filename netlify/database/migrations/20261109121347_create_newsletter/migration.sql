CREATE TABLE "entradas_notificadas" (
	"slug" text PRIMARY KEY,
	"notificada_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suscriptores" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"token" text NOT NULL UNIQUE,
	"confirmado_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
