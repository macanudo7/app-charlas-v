import { pgTable, serial, text, varchar, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Tabla de Usuarios (Administradores del sistema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Tabla de Charlas
export const charlas = pgTable("charlas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  expositor: text("expositor").notNull(),
  fecha: timestamp("fecha").notNull(),
  cupos: integer("cupos").default(50),
  lugar: text("lugar"),
  activo: boolean("activo").default(true),
});

// 3. Tabla de Participantes (Trabajadores/Estudiantes)
export const participantes = pgTable("participantes", {
  id: serial("id").primaryKey(),
  dni: varchar("dni", { length: 8 }).notNull().unique(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  correo: text("correo"),
  area: varchar("area", { length: 100 }),
  // Nuevos campos de ubicación
  departamento: varchar("departamento", { length: 100 }),
  provincia: varchar("provincia", { length: 100 }),
  distrito: varchar("distrito", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  
});

// 4. Tabla de Inscripciones (Relación Charlas <-> Participantes)
export const inscripciones = pgTable("inscripciones", {
  charlaId: integer("charla_id").notNull().references(() => charlas.id, { onDelete: "cascade" }),
  participanteId: integer("participante_id").notNull().references(() => participantes.id, { onDelete: "cascade" }),
  fechaInscripcion: timestamp("fecha_inscripcion").defaultNow(),
  asistio: boolean("asistio").default(false), // Para marcar asistencia en el evento
}, (t) => ({
  // Definimos una clave primaria compuesta para evitar duplicados
  pk: primaryKey({ columns: [t.charlaId, t.participanteId] }),
}));