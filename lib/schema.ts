import { pgTable, serial, text, varchar, timestamp, integer, boolean, primaryKey, json, foreignKey } from "drizzle-orm/pg-core";
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
  nombreEvento: text("nombre_evento").notNull(),
  slug: text("slug").notNull().unique(),
  fecha: timestamp("fecha").notNull(),
  tituloFormulario: text("titulo_formulario").notNull(),
  banner: text("banner"),      
  fondoBanner: text("fondo_banner"), 
  logos: json("logos").default([]),
  activo: boolean("activo").default(true),
});

// 3. Tabla de Participantes (Trabajadores/Estudiantes)
export const participantes = pgTable("participantes", {
  id: serial("id").primaryKey(),
  dni: varchar("dni", { length: 8 }).notNull().unique(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  correo: text("correo"),
  telefono: varchar("telefono", { length: 15 }), // 🚀 ¡AGREGA ESTA LÍNEA AQUÍ!
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

// 1. Tabla de Departamentos
export const ubigeoPeruDepartments = pgTable("ubigeo_peru_departments", {
  id: varchar("id", { length: 2 }).primaryKey(),
  name: varchar("name", { length: 45 }).notNull(),
});

// 2. Tabla de Provincias
export const ubigeoPeruProvinces = pgTable("ubigeo_peru_provinces", {
  id: varchar("id", { length: 4 }).primaryKey(),
  name: varchar("name", { length: 45 }).notNull(),
  departmentId: varchar("department_id", { length: 2 }),
});

// 3. Tabla de Distritos
export const ubigeoPeruDistricts = pgTable("ubigeo_peru_districts", {
  id: varchar("id", { length: 6 }).primaryKey(),
  name: varchar("name", { length: 45 }).notNull(),
  provinceId: varchar("province_id", { length: 4 }),
  departmentId: varchar("department_id", { length: 2 }),
});