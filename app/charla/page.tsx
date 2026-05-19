import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateCharlaForm from "@/app/charla/create-form";

export default async function CharlasPage() {
  // Verificación estricta de sesión en servidor
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#eaeaea] font-sans text-gray-800">
      {/* HEADER CORPORATIVO */}
      <header className="bg-[#1b1c54] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex flex-col items-start select-none">
          <span className="text-xs tracking-widest uppercase font-semibold text-gray-300">CEMENTO</span>
          <span className="text-3xl font-black tracking-tighter leading-none">YURA</span>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <a href="/admin" className="hover:text-cyan-400 transition-colors text-gray-300">← Volver al Panel</a>
        </nav>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-[#1b1c54] mb-8 uppercase tracking-wide">
          Configuración de Nueva Charla / Evento
        </h1>
        
        {/* Renderizado del Formulario */}
        <CreateCharlaForm />
      </main>
    </div>
  );
}