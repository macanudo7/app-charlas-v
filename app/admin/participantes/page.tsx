import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { obtenerParticipantes, obtenerCharlasSelect } from "@/lib/actions";
import FiltroCharla from "./filtro-charla";
import BotonExportarExcel from "./boton-excel"; // 👈 Importamos el nuevo botón
import participantStyle from "@/app/participantes/page.module.css";

interface PageProps {
  searchParams: Promise<{
    charlaId?: string;
    dni?: string;
    fecha?: string;
  }>;
}

export default async function ParticipantesPage({ searchParams }: PageProps) {
  // Verificación estricta de sesión en servidor
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Desempaquetamos los parámetros de búsqueda de la URL
  const { charlaId, dni, fecha } = await searchParams;

  // 2. Ejecutamos las peticiones enviándole los 3 filtros al backend
  const [listaParticipantes, listaCharlas] = await Promise.all([
    obtenerParticipantes(charlaId, dni, fecha),
    obtenerCharlasSelect()
  ]);

  return (
    <div className="min-h-screen bg-default">
      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* ENCABEZADO */}
        <h1 className="text-center text-3xl font-semibold text-[var(--main-color)] mb-12 uppercase">
          Participantes Registrados ({listaParticipantes.length})
        </h1>

        {/* 🔍 BARRA DE ACCIONES */}
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm space-y-4">
          
          {/* Fila superior: Filtros (Ocupa todo el ancho disponible) */}
          <div className="block w-full">
            <FiltroCharla charlasList={listaCharlas} />
          </div>

          {/* Fila inferior: Botón Excel alineado al extremo derecho */}
          <div className="text-right">
            <div className="inline-block">
              <BotonExportarExcel data={listaParticipantes} />
            </div>
          </div>

        </div>

        {/* TABLA RESPONSIVA */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden mt-6">
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
                  <tr className="bg-[var(--main-color)] text-white text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 text-center">DNI</th>
                    <th className="py-3 px-4 text-center">Participante</th>
                    <th className="py-3 px-4 text-center">Capacitación (Slug)</th>
                    <th className="py-3 px-4 text-center">EMAIL</th>
                    <th className="py-3 px-4 text-center">TELEFONO</th>
                    <th className="py-3 px-4 text-center">¿Cómo se enteró?</th>
                    <th className="py-3 px-4 text-center">Ubicación (Ubigeo)</th>
                    <th className="py-3 px-4 text-center">F. Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {listaParticipantes.map((item, index) => (
                    <tr key={`${item.id}-${item.charlaId}-${index}`} className="hover:bg-gray-50 transition-colors">
                      
                      {/* DNI */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {item.dni}
                      </td>

                      {/* Nombre y Apellidos */}
                      <td className="py-3.5 px-4 font-medium uppercase">
                        {item.apellido}, {item.nombre}
                      </td>

                      {/* CAPACITACIÓN SLUG */}
                      <td className="py-3.5 px-4">
                        <span className="bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-bold px-2 py-1 rounded lowercase">
                          {item.charlaSlug}
                        </span>
                      </td>

                      {/* Correo */}
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {item.correo || "Sin correo"}
                      </td>

                      {/* Telefono */}
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {item.telefono || "Sin telefono"}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500 uppercase text-center">
                        {item.comoTeEnteraste || "-"}
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

                      {/* Fecha */}
                      <td className="py-3.5 px-3 text-center text-xs text-gray-500">
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