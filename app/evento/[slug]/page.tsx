'use client';

import { useState, use } from "react";
import { consultarDni } from "@/lib/actions";

interface EventoPageProps {
  params: Promise<{ slug: string }>;
}

// Nota: Como ahora es un Client Component, si necesitas traer la 'charla' de la BD al cargar,
// lo ideal es pasarle los datos desde un page.tsx padre, o usar 'use' de React si mantienes la firma.
// Para este ejemplo, asumiremos que recibes los datos necesarios o usas fetch. 
// Aquí nos enfocamos en la lógica del formulario interactivo:

export default function EventoPublicPage({ params }: EventoPageProps) {
  const { slug } = use(params); // Desempaquetamos el slug en cliente

  // Estados para el autocompletado y carga
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorDni, setErrorDni] = useState("");

  // Función que conecta con el Server Action
  const handleBuscarDni = async () => {
    if (dni.length !== 8) {
      setErrorDni("El DNI debe tener 8 dígitos numéricos.");
      return;
    }

    setErrorDni("");
    setBuscando(true);

    const resultado = await consultarDni(dni);

    setBuscando(false);

    if (resultado.success) {
      setNombre(resultado.nombre || "");
      setApellido(resultado.apellido || "");
    } else {
      setErrorDni(resultado.error || "No se encontró el DNI.");
      // Limpiamos los campos para evitar registros inconsistentes
      setNombre("");
      setApellido("");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] font-sans text-gray-800 flex flex-col justify-between">
      
      {/* BANNER (Simplificado para el ejemplo de Cliente) */}
      <section className="bg-[#1b1c54] py-12 text-white text-center">
        <span className="bg-cyan-500 text-[#1b1c54] text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded">
          REGISTRO CON CONSULTA DNI ACTIVE
        </span>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase mt-2">
          Formulario de Inscripción
        </h1>
      </section>

      {/* CUERPO CENTRAL */}
      <main className="max-w-2xl mx-auto w-full px-4 py-10 flex-1">
        <div className="bg-white rounded shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
          
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide text-[#1b1c54]">
              Ingresa tus datos
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Digita tu DNI y presiona la lupa para buscar tus datos en RENIEC de forma automática.
            </p>
          </div>

          <form className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BUSCADOR DE DNI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  DNI (Buscar) *
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    name="dni" 
                    required 
                    maxLength={8} 
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))} // Solo números
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                    placeholder="8 dígitos"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarDni}
                    disabled={buscando || dni.length !== 8}
                    className="bg-[#1b1c54] hover:bg-[#252774] disabled:bg-gray-300 text-white px-4 rounded flex items-center justify-center transition-colors shadow"
                    title="Buscar DNI en Reniec"
                  >
                    {buscando ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errorDni && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">{errorDni}</p>
                )}
              </div>

              {/* Área / Ocupación */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Área u Ocupación
                </label>
                <input 
                  type="text" name="area" maxLength={100}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                  placeholder="Ej: Construcción, Logística"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre (AUTOCOMPLETADO) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nombre *
                </label>
                <input 
                  type="text" 
                  name="nombre" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  readOnly={nombre.length > 0} // Lo hace de solo lectura si ya se buscó con éxito
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${nombre.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-600 font-medium' : 'border-gray-300 focus:border-[#1b1c54]'}`}
                  placeholder="Se auto-completa al buscar DNI"
                />
              </div>

              {/* Apellido (AUTOCOMPLETADO) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Apellido *
                </label>
                <input 
                  type="text" 
                  name="apellido" 
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  readOnly={apellido.length > 0}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${apellido.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-600 font-medium' : 'border-gray-300 focus:border-[#1b1c54]'}`}
                  placeholder="Se auto-completa al buscar DNI"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input 
                type="email" name="correo"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* UBICACIÓN */}
            <div className="border-t pt-4 mt-6">
              <span className="block text-xs font-black uppercase tracking-widest text-[#1b1c54] mb-3">
                Datos de Ubicación
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Departamento</label>
                  <input type="text" name="departamento" maxLength={100} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Arequipa" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Provincia</label>
                  <input type="text" name="provincia" maxLength={100} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Arequipa" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Distrito</label>
                  <input type="text" name="distrito" maxLength={100} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Yura" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#1b1c54] hover:bg-[#252774] text-white text-xs font-bold uppercase tracking-widest py-3 rounded shadow transition-all mt-6 flex items-center justify-center gap-2"
            >
              Confirmar Mi Registro
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}