'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation'; // <-- IMPORTANTE: Importamos el redirect nativo

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  let esLoginCorrecto = false;

  try {
    const credentials = Object.fromEntries(formData);
    
    // Ejecutamos el inicio de sesión
    await signIn('credentials', {
      ...credentials,
      redirect: false, // <-- LE DECIMOS A AUTH.JS QUE NO REDIRIJA ÉL MISMO
    });

    // Si llegó hasta aquí sin lanzar error, las credenciales son buenas
    esLoginCorrecto = true;

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }

  // INDEPENDIENTE DEL TRY/CATCH: Redirigimos de forma nativa
  if (esLoginCorrecto) {
    redirect('/admin');
  }
}