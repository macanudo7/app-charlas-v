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
    <div className="bg-default min-h-screen text-gray-800">

      {/* CONTENIDO */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <a href="/admin" className="hover:text-cyan-400 transition-colors text-black-300 pb-8 block">← Volver al Panel</a>
        <h1 className="text-2xl font-semibold text-[var(--main-color)] mb-8 uppercase tracking-wide text-center">
          Configuración de Nueva Charla / Evento
        </h1>
        
        {/* Renderizado del Formulario */}
        <CreateCharlaForm />
      </div>
    </div>
  );
}