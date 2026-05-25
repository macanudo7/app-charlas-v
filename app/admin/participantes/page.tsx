import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { obtenerParticipantes, obtenerCharlasSelect } from "@/lib/actions";
import FiltroCharla from "./filtro-charla";

interface PageProps {
  searchParams: Promise<{ charlaId?: string }>;
}

export default async function ParticipantesPage({ searchParams }: PageProps) {
  // Verificación estricta de sesión en servidor
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Desempaquetamos los parámetros de búsqueda de la URL
  const { charlaId } = await searchParams;

  // 2. Ejecutamos las peticiones en paralelo directo en Supabase
  const [listaParticipantes, listaCharlas] = await Promise.all([
    obtenerParticipantes(charlaId),
    obtenerCharlasSelect()
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded shadow-sm border-l-4 border-[#1b1c54]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 block">
              PANEL DE CONTROL INTERNO
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 uppercase mt-0.5">
              Participantes Registrados ({listaParticipantes.length})
            </h1>
          </div>
        </div>

        {/* 🔍 COMPONENTE DE FILTRADO INTERACTIVO */}
        <FiltroCharla charlasList={listaCharlas} />

        {/* TABLA RESPONSIVA */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          {listaParticipantes.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-bold uppercase tracking-wide">
                No se encontraron participantes para esta selección
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1b1c54] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">DNI</th>
                    <th className="py-3 px-4">Participante</th>
                    <th className="py-3 px-4">Capacitación (Slug)</th> {/* 👈 Nueva columna */}
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Ubicación (Ubigeo)</th>
                    <th className="py-3 px-4 text-center">F. Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {listaParticipantes.map((item, index) => (
                    // Usamos una combinación de ID y charlaId para garantizar una key única por fila repetida
                    <tr key={`${item.id}-${item.charlaId}-${index}`} className="hover:bg-gray-50 transition-colors">
                      
                      {/* DNI */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {item.dni}
                      </td>

                      {/* Nombre y Apellidos */}
                      <td className="py-3.5 px-4 font-medium uppercase">
                        {item.apellido}, {item.nombre}
                      </td>

                      {/* 🚀 CAPACITACIÓN SLUG (Nueva celda renderizada) */}
                      <td className="py-3.5 px-4">
                        <span className="bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-mono font-bold px-2 py-1 rounded lowercase">
                          {item.charlaSlug}
                        </span>
                      </td>

                      {/* Correo */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        {item.correo || "Sin correo"}
                      </td>

                      {/* Ubicación */}
                      <td className="py-3.5 px-4">
                        {item.departamento ? (
                          <div className="text-xs space-x-1 uppercase">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-600 border">
                              {item.departamento}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span>{item.provincia}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-500 italic">{item.distrito}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No especificado</span>
                        )}
                      </td>

                      {/* Fecha (Usamos la fecha de la inscripción, no de creación del usuario) */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-500">
                        {item.fechaInscripcion ? new Date(item.fechaInscripcion).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        }) : "-"}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}