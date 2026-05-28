import { auth } from "@/auth";
import { db } from "@/lib/db";
import { charlas } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  // 1. Verificación de seguridad en el servidor
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // 2. Traer las charlas en tiempo real desde PostgreSQL usando Drizzle
  const listaCharlas = await db.select().from(charlas).orderBy(desc(charlas.fecha));

  return (
    <div className="bg-default min-h-screen">

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 py-14">
        
        {/* Título Central */}
        <h1 className="text-center text-3xl font-semibold text-[var(--main-color)] mb-12 uppercase">
          Lista de Charlas
        </h1>

        {/* ACCIONES SUPERIORES (Filtro y Botón Agregar) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          {/* Selector de Buscar Charla */}
          <div className="relative w-full sm:w-64">
            {/* <select className="w-full bg-white border border-gray-300 rounded px-4 py-2 pr-8 shadow-sm appearance-none focus:outline-none focus:border-[#1b1c54] text-sm">
              <option>Buscar charla</option>
              {listaCharlas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombreEvento}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div> */}
          </div>

          {/* Botón Agregar Charla */}
          <Link href="/charla" className="w-full sm:w-auto bg-[var(--main-color)] hover:bg-[var(--dark-color)] text-white text-xs font-medium tracking-wider uppercase px-6 py-2.5 shadow transition-all duration-200">
            + Agregar Charla
          </Link>
        </div>

        {/* TABLA DE CHARLAS */}
        <div className="bg-white shadow-md overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--main-color)] text-white text-xs tracking-wider uppercase font-semibold">
                <th className="py-3 px-6 text-center w-40">Fecha</th>
                <th className="py-3 px-6 text-center">Charla</th>
                <th className="py-3 px-6 text-center w-32">Estado</th>
                <th className="py-3 px-6 text-center w-36">Acciones</th>
                <th className="py-3 px-6 text-center w-36">Certificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {listaCharlas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No hay charlas registradas todavía. ¡Usa el Seed o agrega una nueva!
                  </td>
                </tr>
              ) : (
                listaCharlas.map((charla) => {
                  // Calcular estado dinámicamente según la fecha actual
                  const esPasada = new Date(charla.fecha) < new Date();
                  const estadoTexto = esPasada ? "Pasado" : "Vigente";

                  // Formatear fecha a estilo estructurado (DD / MM / YY)
                  const fechaFormateada = new Date(charla.fecha).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }).replace(/\//g, " / ");

                  return (
                    <tr key={charla.id} className="hover:bg-gray-50 transition-colors">
                      {/* Fecha */}
                      <td className="py-4 px-6 text-center text-gray-600">
                        {fechaFormateada}
                      </td>
                      
                      {/* Título de la Charla */}
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {charla.nombreEvento}
                      </td>
                      
                      {/* Estado */}
                      <td className="py-4 px-6 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          esPasada ? "bg-gray-100 text-gray-600" : "bg-green-50 text-green-700"
                        }`}>
                          {estadoTexto}
                        </span>
                      </td>
                      
                      {/* Iconos de Acciones (SVG puros e idénticos a tu diseño) */}
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center space-x-4 text-[#1b1c54]">
                          {/* Ver (Ojo) */}
                          <Link 
                            href={`/evento/${charla.slug}`} 
                            target="_blank" // Opcional: Abre la vista pública en una pestaña nueva para no perder la tabla de administración
                            className="hover:text-cyan-500 transition-colors" 
                            title="Ver landing pública"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                                                
                          {/* Editar (Etiqueta/Lápiz) */}
                          {/* <button className="hover:text-amber-500 transition-colors" title="Editar charla">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button> */}
                          
                          {/* Eliminar (Tacho de Basura) */}
                          {/* <button className="hover:text-red-500 transition-colors" title="Eliminar charla">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button> */}
                        </div>
                      </td>
                      <td className="py-4 px-6 flex justify-center items-center">
                        {esPasada && (
                          <a
                            href={`/api/certificados/${charla.id}`}
                            target="_blank"
                            className="hover:text-green-600 transition-colors"
                            title="Descargar certificados"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16"
                              />
                            </svg>
                          </a>
                        )}

                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}