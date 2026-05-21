import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Creamos un Pool de conexiones (más eficiente para apps web)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Opciones recomendadas para producción y poolers externos
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
