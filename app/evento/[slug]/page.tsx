'use client';

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { consultarDni } from "@/lib/actions";
import Image from "next/image";
import eventStyle from "@/app/evento/[slug]/page.module.css";
import { obtenerDepartamentos, obtenerProvinciasPorDepartamento, obtenerDistritosPorProvincia, registrarParticipante, obtenerEventoPorSlug} from "@/lib/actions";

// Estructura interna para los combos
interface UbigeoItem {
  id: string;
  nombre: string;
}

interface EventoPageProps {
  params: Promise<{ slug: string }>;
  charlaId: number;
}

interface Evento {
  id: number
  nombreEvento: string
  slug: string
  banner: string | null
  fondoBanner: string | null
  tituloFormulario: string
  logos: string[] | null
}

// Nota: Como ahora es un Client Component, si necesitas traer la 'charla' de la BD al cargar,
// lo ideal es pasarle los datos desde un page.tsx padre, o usar 'use' de React si mantienes la firma.
// Para este ejemplo, asumiremos que recibes los datos necesarios o usas fetch. 
// Aquí nos enfocamos en la lógica del formulario interactivo:

export default function EventoPublicPage({ params, charlaId }: EventoPageProps) {

  const { slug } = use(params); // Desempaquetamos el slug en cliente
  const router = useRouter();


  // Traer la información registrada de la creación del evento para mostrarlo en el front
  const [evento, setEvento] = useState<Evento | null>(null)

  useEffect(() => {
    const cargarEvento = async () => {
      const data = await obtenerEventoPorSlug(slug);
      
      // 🚀 Le aseguramos a TypeScript que los datos coinciden con nuestra interfaz Cliente
      setEvento(data as Evento | null);
    };
    cargarEvento();
  }, [slug]);

  // Estados para Ubigeo Dinámico
  const [listas, setListas] = useState<{
    departamentos: UbigeoItem[];
    provincias: UbigeoItem[];
    distritos: UbigeoItem[];
  }>({ departamentos: [], provincias: [], distritos: [] });

  const [seleccion, setSeleccion] = useState({
    departamento: "",
    provincia: "",
    distrito: ""
  });

  // Cargar departamentos del SQL al montar la pantalla
  useEffect(() => {
    obtenerDepartamentos().then((data) => {
      setListas(prev => ({ ...prev, departamentos: data }));
    });
  }, []);

  // Al cambiar Departamento -> Cargar Provincias reales
  const handleCambioDepartamento = async (idDep: string) => {
    setSeleccion({ departamento: idDep, provincia: "", distrito: "" });
    setListas(prev => ({ ...prev, provincias: [], distritos: [] }));

    if (idDep) {
      const provs = await obtenerProvinciasPorDepartamento(idDep);
      setListas(prev => ({ ...prev, provincias: provs }));
    }
  };

  // Al cambiar Provincia -> Cargar Distritos reales
  const handleCambioProvincia = async (idProv: string) => {
    setSeleccion(prev => ({ ...prev, provincia: idProv, distrito: "" }));
    setListas(prev => ({ ...prev, distritos: [] }));

    if (idProv) {
      const dists = await obtenerDistritosPorProvincia(idProv);
      setListas(prev => ({ ...prev, distritos: dists }));
    }
  };



  // Estados para el autocompletado y carga
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorDni, setErrorDni] = useState("");
  //const [area, setArea] = useState("");
  const [correo, setCorreo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [telefono, setTelefono] = useState(""); // Guarda el Celular

  // Handler que se ejecuta al enviar el formulario completo
  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario("");
    setMensajeExito("");
    setGuardando(true);

    // Encontrando los nombres de texto correspondientes para guardar en tu varchar de texto
    const nombreDep = listas.departamentos.find(d => d.id === seleccion.departamento)?.nombre || "";
    const nombreProv = listas.provincias.find(p => p.id === seleccion.provincia)?.nombre || "";
    const nombreDist = listas.distritos.find(d => d.id === seleccion.distrito)?.nombre || "";

    const resultado = await registrarParticipante({
      dni,
      nombre,
      apellido,
      correo,
      telefono,
      area:"",
      departamento: nombreDep,
      provincia: nombreProv,
      distrito: nombreDist,
      slug: slug
    });

    setGuardando(false);

    if (resultado.success) {
      setMensajeExito("¡Registro completado con éxito! Tu asistencia ha sido confirmada.");
      // Limpiamos el formulario
      setDni(""); setNombre(""); setApellido(""); setCorreo("");
      setSeleccion({ departamento: "", provincia: "", distrito: "" });
    } else {
      setErrorFormulario(resultado.error || "Ocurrió un error.");
    }
  };

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

  if (!evento) {
    return (
      <div className="min-h-screen bg-[#eaeaea] flex items-center justify-center font-semibold text-[#1b1c54]">
        Cargando capacitación de Yura...
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#eaeaea] text-gray-800 flex flex-col justify-between">

      {/* BANNER INSTITUCIONAL YURA */}
      <div className={`${eventStyle.eventBanner} flex items-center justify-center`}
        style={{ backgroundImage: `url(${evento?.fondoBanner || "/img/bg-concreteras-form.webp"})` }}
      >
        <div className="relative mx-auto flex w-full flex-col space-y-1.5 p-4">
          <div className="flex w-full items-center justify-center">
            <Image
              src={evento?.banner || "/img/banner-orgullo-2.webp"}
              alt={evento?.nombreEvento || "Banner del evento Yura"}
              width={1000}
              height={1000}
              className="h-[75vh] w-auto object-contain"
              priority
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

      {/* CUERPO CENTRAL CON FORMULARIO INTERACTIVO */}
      <div className={`${eventStyle.eventForm}`}>
        <a className={`${eventStyle.eventGoTo}`} href="#formulario">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z" />
          </svg>
        </a>

        <div className="relative mx-auto flex w-full flex-col gap-4 p-4 max-w-6xl">
          <div className="p-3" id="formulario">

            {/* Controlamos si se muestra el mensaje de éxito o los campos del formulario */}
            {mensajeExito ? (
              <div className={`${eventStyle.eventFormSucess} border p-8 rounded text-center space-y-4 max-w-2xl mx-auto my-10 shadow-md`}>
                <span className="text-4xl">✅</span>
                <p className="text-base font-bold uppercase tracking-wide mt-3">{mensajeExito}</p>
                <button
                  onClick={() => setMensajeExito("")}
                  className="text-xs text-white px-5 py-2.5 rounded uppercase tracking-wider font-bold transition-all"
                >
                  Registrar otro participante
                </button>
              </div>
            ) : (
              <>
                <div className={`${eventStyle.eventFormTitle} font-bold text-xl md:text-3xl pb-4`}>
                  {evento?.tituloFormulario || "Acompáñenos en este importante<br />evento del sector"}
                </div>
                <p className={`${eventStyle.eventFormDesc} text-white-500 mt-1`}>
                  Digita tu DNI y presiona la lupa para buscar tus datos en RENIEC de forma automática.
                </p>

                <div className="pt-10">
                  <form onSubmit={handleSubmitRegistro} className="space-y-4">

                    <div className="grid grid-cols-1 gap-4">
                      {/* BUSCADOR DE DNI */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          DNI (Buscar) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="dni"
                            required
                            maxLength={8}
                            value={dni}
                            onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))}
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre (AUTOCOMPLETADO) */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          required
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          readOnly={nombre.length > 0}
                          className={`w-full border px-3 py-2 text-sm focus:outline-none ${nombre.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-600 font-medium' : 'border-gray-300 focus:border-[#1b1c54]'}`}
                          placeholder="Se auto-completa al buscar su DNI"
                        />
                      </div>

                      {/* Apellido (AUTOCOMPLETADO) */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Apellidos <span className="text-red-500">*</span>
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
                          Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="correo"
                          required
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                          placeholder="ejemplo@correo.com"
                        />
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Celular <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          required
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))} // Solo números en celular
                          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                          placeholder="Ej: 987654321"
                        />
                      </div>
                    </div>

                    {/* UBICACIÓN DINÁMICA DE SUPABASE */}
                    <div className="">

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* DEPARTAMENTO */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Departamento <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="departamento"
                            value={seleccion.departamento}
                            onChange={(e) => handleCambioDepartamento(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1b1c54]"
                          >
                            <option value="">-- Seleccione --</option>
                            {listas.departamentos.map((dep) => (
                              <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                            ))}
                          </select>
                        </div>

                        {/* PROVINCIA */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Provincia <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="provincia"
                            value={seleccion.provincia}
                            disabled={!seleccion.departamento}
                            onChange={(e) => handleCambioProvincia(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white disabled:bg-gray-100 focus:outline-none focus:border-[#1b1c54]"
                          >
                            <option value="">-- Seleccione --</option>
                            {listas.provincias.map((prov) => (
                              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                            ))}
                          </select>
                        </div>

                        {/* DISTRITO */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Distrito <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="distrito"
                            value={seleccion.distrito}
                            disabled={!seleccion.provincia}
                            onChange={(e) => setSeleccion(prev => ({ ...prev, distrito: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm bg-white disabled:bg-gray-100 focus:outline-none focus:border-[#1b1c54]"
                          >
                            <option value="">-- Seleccione --</option>
                            {listas.distritos.map((dist) => (
                              <option key={dist.id} value={dist.id}>{dist.nombre}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mensajes de error del Servidor */}
                    {errorFormulario && (
                      <p className="text-red-500 text-xs font-bold bg-red-50 p-3 border border-red-300 rounded text-center">
                        ⚠️ {errorFormulario}
                      </p>
                    )}

                    {/* BOTÓN DE CONFIRMACIÓN */}
                    <button
                      type="submit"
                      disabled={guardando || !nombre || !apellido || !seleccion.departamento || !seleccion.provincia || !seleccion.distrito }
                      className={`${eventStyle.eventBtn} h-12 px-12 text-white transition mt-8 flex items-center justify-center gap-2 disabled:bg-gray-400`}
                    >
                      {guardando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Procesando Asistencia...
                        </>
                      ) : (
                        "Confirmar Mi Registro"
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER CORPORATIVO YURA */}
      <div className={`${eventStyle.eventFooter} flex items-center justify-center`}>
        <div className="relative mx-auto flex w-full flex-col max-w-7xl p-4">
          <div className="w-full p-3">
            <div className={`${eventStyle.eventFooterTitle} font-bold text-2xl pb-4`}>
              Organizado por:
            </div>
            <div className="flex items-center justify-center md:justify-start gap-8 mt-4 pt-4 flex-wrap">
              <Image
                src="/img/logo-yura.png"
                alt="Yura Logo"
                width={200}
                height={200}
                className="h-auto w-full max-w-40 object-contain mt-4"
              />
              {evento?.logos?.map((logo) => (

                <Image
                  key={logo}
                  src={logo}
                  alt="Logo organizador"
                  width={180}
                  height={180}
                  className="mt-4"
                />

              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}