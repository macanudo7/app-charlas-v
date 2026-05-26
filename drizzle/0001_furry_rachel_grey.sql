CREATE TABLE "ubigeo_peru_departments" (
	"id" varchar(2) PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ubigeo_peru_districts" (
	"id" varchar(6) PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL,
	"province_id" varchar(4),
	"department_id" varchar(2)
);
--> statement-breakpoint
CREATE TABLE "ubigeo_peru_provinces" (
	"id" varchar(4) PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL,
	"department_id" varchar(2)
);
--> statement-breakpoint
ALTER TABLE "participantes" ADD COLUMN "telefono" varchar(15);