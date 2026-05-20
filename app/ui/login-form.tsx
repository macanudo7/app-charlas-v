'use client';

import { authenticate } from '@/app/lib/actions';
import { useActionState } from 'react'; // <-- Cambiado de 'react-dom' a 'react'
import { useFormStatus } from 'react-dom';

export default function LoginForm() {
  // Cambiado useFormState por useActionState
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 px-6 pb-4 pt-8">
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
              Correo electrónico <span>*</span>
            </label>
            <input
              className="peer block w-full bg-white py-[12px] pl-3 pr-3 text-sm placeholder:text-gray-500"
              id="email" type="email" name="email" placeholder="admin@correo.com" required
            />
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
              Contraseña <span>*</span>
            </label>
            <input
              className="peer block w-full bg-white py-[12px] pl-3 pr-3 text-sm placeholder:text-gray-500"
              id="password" type="password" name="password" placeholder="******" required minLength={6}
            />
          </div>
        </div>
        <LoginButton />
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      className="mt-10 flex w-full items-center justify-center px-4 py-2 font-medium text-white disabled:bg-gray-400"
      aria-disabled={pending}
    >
      {pending ? 'Cargando...' : 'Iniciar sesión'}
    </button>
  );
}