CREATE TABLE "charlas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_evento" text NOT NULL,
	"slug" text NOT NULL,
	"fecha" timestamp NOT NULL,
	"titulo_formulario" text NOT NULL,
	"banner" text,
	"fondo_banner" text,
	"logos" json DEFAULT '[]'::json,
	"activo" boolean DEFAULT true,
	CONSTRAINT "charlas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inscripciones" (
	"charla_id" integer NOT NULL,
	"participante_id" integer NOT NULL,
	"fecha_inscripcion" timestamp DEFAULT now(),
	"asistio" boolean DEFAULT false,
	CONSTRAINT "inscripciones_charla_id_participante_id_pk" PRIMARY KEY("charla_id","participante_id")
);
--> statement-breakpoint
CREATE TABLE "participantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"dni" varchar(8) NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"correo" text,
	"area" varchar(100),
	"departamento" varchar(100),
	"provincia" varchar(100),
	"distrito" varchar(100),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "participantes_dni_unique" UNIQUE("dni")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" varchar(20) DEFAULT 'admin',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_charla_id_charlas_id_fk" FOREIGN KEY ("charla_id") REFERENCES "public"."charlas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;