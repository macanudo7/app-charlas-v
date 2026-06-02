import 'dotenv/config';
import { db } from './lib/db';
import { users } from './lib/schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando el sembrado de datos (Solo Administrador)...');

  // Encriptamos la contraseña
  const hashedAdminPassword = await bcrypt.hash('eZ9O623Ad9xR', 10);
  
  console.log('👤 Insertando usuario administrador...');
  
  await db.insert(users).values({
    nombre: 'Administrador Sistema',
    email: 'adminyura@yura.com', // Puedes cambiarlo por el que prefieras
    password: hashedAdminPassword,
    role: 'admin',
  }).onConflictDoNothing(); 

  console.log('✅ Administrador creado con éxito.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});