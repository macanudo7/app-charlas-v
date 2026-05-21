'use client';

import { useState, use } from "react";
import { consultarDni } from "@/lib/actions";
import Image from "next/image";
import eventStyle from "@/app/evento/[slug]/page.module.css";

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
    <div className="min-h-screen bg-[#eaeaea] text-gray-800 flex flex-col justify-between">

      {/* BANNER */}
      <div className={`${eventStyle.eventBanner} flex items-center justify-center`}>
        <div className="relative mx-auto flex w-full flex-col space-y-1.5 p-4">
          <div className="flex w-full items-center justify-center">
            <Image
              src="/img/bg-forms-yura.png"
              alt="Orgullo Maestro Banner"
              width={1000}
              height={1000}
              className="h-[75vh] w-auto object-contain"
            />
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.5 19.6" preserveAspectRatio="none">
          <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 18.8 141.8 4.1 283.5 18.8 283.5 0z" />
          <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 12.6 141.8 4 283.5 12.6 283.5 0z" />
          <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 6.4 141.8 4 283.5 6.4 283.5 0z" />
          <path className="elementor-shape-fill" d="M0 0L0 1.2 141.8 4 283.5 1.2 283.5 0z" />
        </svg>
      </div>

      {/* CUERPO CENTRAL */}
      <div className={`${eventStyle.eventForm} `}>
        <a className={`${eventStyle.eventGoTo} `} href="#formulario">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z" /></svg>
        </a>
        <div className="relative mx-auto flex w-full flex-col gap-4 p-4 max-w-6xl">
          <div className=" p-3" id="formulario">
            <div className={`${eventStyle.eventFormTitle} font-bold text-xl md:text-3xl pb-4 `}>
              Acompáñenos en esta importante<br></br>capacitación del sector
            </div>
            <p className={`${eventStyle.eventFormDesc} text-white-500 mt-1`}>
              Digita tu DNI y presiona la lupa para buscar tus datos en RENIEC de forma automática.
            </p>
            <div className="pt-10">
              <form className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* BUSCADOR DE DNI */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      DNI (Buscar) <span>*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="dni"
                        required
                        maxLength={8}
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))} // Solo números
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                        placeholder="8 dígitos"
                      />
                      <button
                        type="button"
                        onClick={handleBuscarDni}
                        disabled={buscando || dni.length !== 8}
                        className={`${eventStyle.eventFormBtn2} hover:bg-[#252774] disabled:bg-gray-300 text-white px-4 flex items-center justify-center transition-colors shadow`}
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
                    <label className="block text-xs font-bold uppercase mb-1">
                      Empresa / Institución <span>*</span>
                    </label>
                    <input
                      type="text" name="area" maxLength={100}
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                      placeholder="Ej: Construcción, Logística"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre (AUTOCOMPLETADO) */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Nombres <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      readOnly={nombre.length > 0} // Lo hace de solo lectura si ya se buscó con éxito
                      className={`w-full border px-3 py-2 text-sm focus:outline-none ${nombre.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-600 font-medium' : 'border-gray-300 focus:border-[#1b1c54]'}`}
                      placeholder="Se auto-completa al buscar su DNI"
                    />
                  </div>

                  {/* Apellido (AUTOCOMPLETADO) */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Apellidos <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      readOnly={apellido.length > 0}
                      className={`w-full border px-3 py-2 text-sm focus:outline-none ${apellido.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-600 font-medium' : 'border-gray-300 focus:border-[#1b1c54]'}`}
                      placeholder="Se auto-completa al buscar su DNI"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Correo */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Correo Electrónico <span>*</span>
                    </label>
                    <input
                      type="email" name="correo"
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Celular <span>*</span>
                    </label>
                    <input
                      type="tel" name="telefono"
                      className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                      placeholder="Ej: 987654321"
                    />
                  </div>
                </div>


                {/* UBICACIÓN */}
                <div className="pt-2 mt-2">

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1">Departamento <span>*</span></label>
                      <input type="text" name="departamento" maxLength={100} className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Arequipa" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1">Provincia <span>*</span></label>
                      <input type="text" name="provincia" maxLength={100} className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Arequipa" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1">Distrito <span>*</span></label>
                      <input type="text" name="distrito" maxLength={100} className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-[#1b1c54]" placeholder="Yura" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`${eventStyle.eventBtn} h-12 px-12 text-white transition mt-8`}
                >
                  Confirmar Mi Registro
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={`${eventStyle.eventFooter} flex items-center justify-center `}>
        <div className="relative mx-auto flex w-full flex-col max-w-7xl p-4">
          <div className="w-full p-3">
            <div className={`${eventStyle.eventFooterTitle} font-bold text-2xl pb-4`}>
              Organizado por:
            </div>
            <div className="flex items-center justify-start gap-4 mt-4 pt-4">
              <Image
                src="/img/logo-yura.png"
                alt="Yura Logo"
                width={200}
                height={200}
                className="h-auto w-full max-w-40 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}