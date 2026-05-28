'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// 1. Asegúrate de que la interfaz use exactamente este nombre:
interface CharlaSelect {
  id: number;
  nombre: string;
}

// 2. Desempaqueta la propiedad con el mismo nombre en los argumentos
export default function FiltroCharla({ charlasList }: { charlasList: CharlaSelect[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Inicializamos los estados capturando lo que ya venga en la URL actual
  const [charla, setCharla] = useState(searchParams.get("charlaId") || "-- Todas las charlas --");
  const [dni, setDni] = useState(searchParams.get("dni") || "");
  const [fecha, setFecha] = useState(searchParams.get("fecha") || "");

  // 🔄 Efecto inteligente que actualiza la URL cuando cambia cualquier filtro
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (charla && charla !== "-- Todas las charlas --") params.set("charlaId", charla);
    if (dni.trim() !== "") params.set("dni", dni.trim());
    if (fecha) params.set("fecha", fecha);

    // Empuja los filtros a la URL de forma limpia sin recargar la pantalla completa
    router.push(`?${params.toString()}`);
  }, [charla, dni, fecha, router]);

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Filtro por Charlas */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Filtrar por evento
          </label>
          <select
            value={charla}
            onChange={(e) => setCharla(e.target.value)}
            className="w-full border border-gray-300 text-sm p-2 rounded focus:outline-none focus:border-[#1b1c54] bg-white"
          >
            <option value="-- Todas las charlas --">-- Todas las charlas --</option>
            {charlasList.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por DNI */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Buscar por DNI
          </label>
          <input
            type="text"
            maxLength={8}
            placeholder="Escribe un DNI..."
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full border border-gray-300 text-sm p-2 rounded focus:outline-none focus:border-[#1b1c54]"
          />
        </div>

        {/* Filtro por Fecha de Registro */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
            Fecha de Registro
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 text-sm p-2 rounded focus:outline-none focus:border-[#1b1c54]"
          />
        </div>

      </div>

      {/* Botón de Limpieza Completa */}
      {(charla !== "-- Todas las charlas --" || dni !== "" || fecha !== "") && (
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              setCharla("-- Todas las charlas --");
              setDni("");
              setFecha("");
            }}
            className="text-xs font-bold uppercase text-red-600 hover:text-red-800 transition-colors"
          >
            ❌ Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
}