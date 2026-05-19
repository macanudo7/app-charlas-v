import { auth, signOut } from "@/auth";
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
    <div className="min-h-screen bg-[#eaeaea] font-sans text-gray-800">
      
      {/* HEADER CORPORATIVO (NAVBAR) */}
      <header className="bg-[#1b1c54] text-white px-6 py-4 flex justify-between items-center shadow-md">
        {/* Logo Yura */}
        <div className="flex flex-col items-start select-none">
          <span className="text-xs tracking-widest uppercase font-semibold text-gray-300">CEMENTO</span>
          <span className="text-3xl font-black tracking-tighter leading-none">YURA</span>
        </div>

        {/* Menú de Navegación Derecho */}
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <a href="/admin" className="flex flex-col items-center hover:text-cyan-400 transition-colors">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Charlas
          </a>
          <a href="/admin/participantes" className="flex flex-col items-center hover:text-cyan-400 transition-colors text-gray-300">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Participantes
          </a>
          
          {/* Botón Cerrar Sesión integrado en Formulario para Server Action */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="flex flex-col items-center hover:text-red-400 transition-colors text-gray-300">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Título Central */}
        <h1 className="text-center text-3xl font-bold tracking-wide text-[#1b1c54] mb-12 uppercase">
          Lista de Charlas
        </h1>

        {/* ACCIONES SUPERIORES (Filtro y Botón Agregar) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          {/* Selector de Buscar Charla */}
          <div className="relative w-full sm:w-64">
            <select className="w-full bg-white border border-gray-300 rounded px-4 py-2 pr-8 shadow-sm appearance-none focus:outline-none focus:border-[#1b1c54] text-sm">
              <option>Buscar charla</option>
              {listaCharlas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombreEvento}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Botón Agregar Charla */}
          <Link href="/charla" className="w-full sm:w-auto bg-[#1b1c54] hover:bg-[#272974] text-white text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded shadow transition-all duration-200">
            + Agregar Charla
          </Link>
        </div>

        {/* TABLA DE CHARLAS */}
        <div className="bg-white rounded shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1b1c54] text-white text-xs tracking-wider uppercase font-semibold">
                <th className="py-3 px-6 text-center w-32">Fecha</th>
                <th className="py-3 px-6">Charla</th>
                <th className="py-3 px-6 text-center w-32">Estado</th>
                <th className="py-3 px-6 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {listaCharlas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
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
                      <td className="py-4 px-6 text-center font-mono text-gray-600">
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
                          <button className="hover:text-cyan-500 transition-colors" title="Ver detalles">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Editar (Etiqueta/Lápiz) */}
                          <button className="hover:text-amber-500 transition-colors" title="Editar charla">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Eliminar (Tacho de Basura) */}
                          <button className="hover:text-red-500 transition-colors" title="Eliminar charla">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}