'use client';

import { crearCharla } from "@/lib/actions";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

export default function CreateCharlaForm() {
  const [errorMessage, dispatch] = useActionState(crearCharla, undefined);
  const [logoCount, setLogoCount] = useState(0);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > 9) {
        alert("Solo se permite un máximo de 9 logos organizadores.");
        e.target.value = "";
        setLogoCount(0);
      } else {
        setLogoCount(files.length);
      }
    }
  };

  return (
    <form action={dispatch} encType="multipart/form-data" className="space-y-6 p-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Evento */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Nombre del Evento <span>*</span>
          </label>
          <input
            type="text" name="nombreEvento" required
            className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[#1b1c54]"
            placeholder="Ej: Capacitación Planta Yura 2026"
          />
        </div>

        {/* URL / Slug */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            URL del Evento (Slug) <span>*</span>
          </label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              charlas.yura.com.pe/
            </span>
            <input
              type="text" name="slug" required
              className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[#1b1c54]"
              placeholder="seguridad-planta-yura"
            />
          </div>
        </div>

        {/* Fecha del Evento */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Fecha y Hora del Evento <span>*</span>
          </label>
          <input
            type="datetime-local" name="fecha" required
            className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[#1b1c54]"
          />
        </div>

        {/* Título del Formulario */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Título sobre el Formulario <span>*</span>
          </label>
          <input
            type="text" name="tituloFormulario" required
            className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[#1b1c54]"
            placeholder="Ej: Inscríbete ingresando tus datos"
          />
        </div>

        {/* Banner del Evento (Imagen Principal) */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Banner del Evento <span>*</span> <span>(Imagen sin fondo en .png, en proporción 1:1 idealmente)</span>
          </label>
          <input
            type="file" name="banner" accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        {/* Imagen de Fondo del Banner (CAMBIADO A FILE) */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Imagen de Fondo para el Banner <span></span> <span>(Opcional, por defecto usará un fondo de cemento)</span>
          </label>
          <input
            type="file" name="fondoBanner" accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>
      </div>

      {/* Logos de Organizadores (Array de imágenes) */}
      <div className="pt-2">
        <label className="block text-xs font-bold uppercase mb-2">
          Logos de Organizadores (Máx 9) <span></span> <span>(Opcional, incluye por defecto el logo de Yura, seleccionar las imágenes en .png de forma agrupada)</span>
        </label>
        <input
          type="file" name="logos" multiple accept="image/*" onChange={handleLogoChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1b1c54] hover:file:bg-blue-100"
        />
        <p className="mt-2 text-xs text-gray-500">
          Archivos seleccionados: <span className="font-bold text-[#1b1c54]">{logoCount} de 9</span>
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 border-t pt-6">
        <a href="/admin" className="px-5 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
          Cancelar
        </a>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit" disabled={pending}
      className="bg-[#1b1c54] hover:bg-[#252774] text-white px-6 py-2 text-sm font-semibold tracking-wide shadow disabled:bg-gray-400 transition-all"
    >
      {pending ? "Creando evento..." : "Crear Evento"}
    </button>
  );
}