ALTER TABLE "charlas" ADD COLUMN "departamento_lugar" varchar(100);--> statement-breakpoint
ALTER TABLE "charlas" ADD COLUMN "provincia_lugar" varchar(100);--> statement-breakpoint
ALTER TABLE "charlas" ADD COLUMN "created_at" timestamp DEFAULT now();