'use client';

import { useRouter, useSearchParams } from "next/navigation";

// 1. Asegúrate de que la interfaz use exactamente este nombre:
interface FiltroCharlaProps {
  charlasList: { id: number; nombre: string }[]; // Cambié id a 'number' para hacer match con tu serial/integer de Drizzle
}

// 2. Desempaqueta la propiedad con el mismo nombre en los argumentos
export default function FiltroCharla({ charlasList }: FiltroCharlaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const charlaActual = searchParams.get("charlaId") || "todos";

  const handleCambio = (id: string) => {
    if (id === "todos" || !id) {
      router.push("/admin/participantes");
    } else {
      router.push(`/admin/participantes?charlaId=${id}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-4 rounded border">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
        Filtrar por capacitación:
      </label>
      <select
        value={charlaActual}
        onChange={(e) => handleCambio(e.target.value)}
        className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:border-[#1b1c54] max-w-md w-full sm:w-auto font-medium"
      >
        <option value="todos">-- Todas las charlas --</option>
        {charlasList?.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}