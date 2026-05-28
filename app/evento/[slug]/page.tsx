'use client';

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { consultarDni } from "@/lib/actions";
import Image from "next/image";
import eventStyle from "@/app/evento/[slug]/page.module.css";
import { obtenerDepartamentos, obtenerProvinciasPorDepartamento, obtenerDistritosPorProvincia, registrarParticipante, obtenerEventoPorSlug } from "@/lib/actions";

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
  id: number;
  nombreEvento: string;
  slug: string;
  banner: string | null;
  fondoBanner: string | null;
  tituloFormulario: string;
  logos: string[] | null;
  // 🚀 ACTUALIZAMOS LA INTERFAZ CON LOS CAMPOS DE UBIGEO DE LA CHARLA
  departamentoLugar: string | null;
  provinciaLugar: string | null;
}

export default function EventoPublicPage({ params, charlaId }: EventoPageProps) {
  const { slug } = use(params);
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

  // 🚀 1. UNIFICAMOS LA CARGA DEL EVENTO Y LA AUTOSELECCIÓN POR CÓDIGO
  useEffect(() => {
    const cargarEventoYUbigeo = async () => {
      // Carga los datos de la charla
      const data = await obtenerEventoPorSlug(slug);
      const eventoData = data as Evento | null;
      setEvento(eventoData);

      // Carga la lista inicial de departamentos
      const deps = await obtenerDepartamentos();
      setListas(prev => ({ ...prev, departamentos: deps }));

      // Si el evento tiene un departamento configurado por código (Ej: "04")
      if (eventoData?.departamentoLugar) {
        const depId = eventoData.departamentoLugar;

        // Traemos las provincias asociadas a ese código de departamento
        const provs = await obtenerProvinciasPorDepartamento(depId);

        // Verificamos si la provincia de la charla existe en la lista devuelta
        const provId = eventoData.provinciaLugar || "";
        const tieneProvincia = provs.some(p => p.id === provId);

        setListas(prev => ({ ...prev, provincias: provs }));
        setSeleccion(prev => ({
          ...prev,
          departamento: depId,
          provincia: tieneProvincia ? provId : ""
        }));

        // Si hay una provincia válida, precargamos sus distritos automáticamente
        if (tieneProvincia && provId) {
          const dists = await obtenerDistritosPorProvincia(provId);
          setListas(prev => ({ ...prev, distritos: dists }));
        }
      }
    };

    cargarEventoYUbigeo();
  }, [slug]); // 👈 Solo depende del slug del evento

  // Al cambiar Departamento manualmente -> Cargar Provincias reales
  const handleCambioDepartamento = async (idDep: string) => {
    setSeleccion({ departamento: idDep, provincia: "", distrito: "" });
    setListas(prev => ({ ...prev, provincias: [], distritos: [] }));

    if (idDep) {
      const provs = await obtenerProvinciasPorDepartamento(idDep);
      setListas(prev => ({ ...prev, provincias: provs }));
    }
  };

  // Al cambiar Provincia manualmente -> Cargar Distritos reales
  const handleCambioProvincia = async (idProv: string) => {
    setSeleccion(prev => ({ ...prev, provincia: idProv, distrito: "" }));
    setListas(prev => ({ ...prev, distritos: [] }));

    if (idProv) {
      const dists = await obtenerDistritosPorProvincia(idProv);
      setListas(prev => ({ ...prev, distritos: dists }));
    }
  };

  // Validador de errores para el formulario
  const [errores, setErrores] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    departamento: "",
    provincia: "",
    distrito: "",
  });

  const validarFormulario = () => {

    const nuevosErrores = {
      dni: "",
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      departamento: "",
      provincia: "",
      distrito: "",
    };

    let valido = true;

    // DNI
    if (!dni) {
      nuevosErrores.dni = "Ingrese su DNI para autocompletar sus nombres y apellidos";
      valido = false;
    } else if (dni.length !== 8) {
      nuevosErrores.dni = "El DNI debe tener 8 dígitos";
      valido = false;
    }

    // Nombre
    if (!nombre) {
      nuevosErrores.nombre = "Debe buscar un DNI válido";
      valido = false;
    }

    // Apellido
    if (!apellido) {
      nuevosErrores.apellido = "Debe buscar un DNI válido";
      valido = false;
    }

    // Correo
    // if (!correo) {
    //   nuevosErrores.correo = "Ingrese un correo válido";
    //   valido = false;
    // } else if (!/\S+@\S+\.\S+/.test(correo)) {
    //   nuevosErrores.correo = "Correo inválido, intente nuevamente";
    //   valido = false;
    // }

    // Celular
    if (!telefono) {
      nuevosErrores.telefono = "Ingrese su celular";
      valido = false;
    } else if (telefono.length < 9) {
      nuevosErrores.telefono = "Celular inválido, intente nuevamente";
      valido = false;
    }

    // Departamento
    if (!seleccion.departamento) {
      nuevosErrores.departamento = "Seleccione un departamento primero";
      valido = false;
    }

    // Provincia
    if (!seleccion.provincia) {
      nuevosErrores.provincia = "Seleccione una provincia después de departamento";
      valido = false;
    }

    // Distrito
    if (!seleccion.distrito) {
      nuevosErrores.distrito = "Seleccione un distrito después de provincia";
      valido = false;
    }

    setErrores(nuevosErrores);

    return valido;
  };

  const limpiarError = (campo: keyof typeof errores) => {
    setErrores(prev => ({
      ...prev,
      [campo]: ""
    }));
  };


  // Estados para el autocompletado y carga
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorDni, setErrorDni] = useState("");
  const [correo, setCorreo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [telefono, setTelefono] = useState("");

  // Handler que se ejecuta al enviar el formulario completo
  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario("");
    setMensajeExito("");

    const esValido = validarFormulario();

    if (!esValido) {
      setErrorFormulario("Complete todos los campos obligatorios.");
      return;
    }

    setGuardando(true);

    const nombreDep = listas.departamentos.find(d => d.id === seleccion.departamento)?.nombre || "";
    const nombreProv = listas.provincias.find(p => p.id === seleccion.provincia)?.nombre || "";
    const nombreDist = listas.distritos.find(d => d.id === seleccion.distrito)?.nombre || "";

    const resultado = await registrarParticipante({
      dni,
      nombre,
      apellido,
      correo,
      telefono,
      area: "",
      departamento: nombreDep,
      provincia: nombreProv,
      distrito: nombreDist,
      slug: slug
    });

    setGuardando(false);

    if (resultado.success) {
      setMensajeExito("¡Registro completado con éxito! Tu asistencia ha sido confirmada.");
      setDni(""); setNombre(""); setApellido(""); setCorreo(""); setTelefono("");

      // Al limpiar, regresamos a la selección predeterminada del evento
      if (evento?.departamentoLugar) {
        handleCambioDepartamento(evento.departamentoLugar);
      } else {
        setSeleccion({ departamento: "", provincia: "", distrito: "" });
      }
    } else {
      setErrorFormulario(resultado.error || "Ocurrió un error.");
    }
  };

  // Función que conecta con el Server Action de la RENIEC
  const handleBuscarDni = async () => {
    if (!dni) {
      setErrorDni("Ingrese su DNI");
      return;
    }

    if (dni.length !== 8) {
      setErrorDni("El DNI debe tener 8 dígitos numéricos");
      return;
    }

    setErrorDni("");
    setBuscando(true);
    const resultado = await consultarDni(dni);
    setBuscando(false);

    if (resultado.success) {
      setNombre(resultado.nombre || "");
      setApellido(resultado.apellido || "");

      setErrores(prev => ({
        ...prev,
        nombre: "",
        apellido: "",
        dni: ""
      }));
    } else {
      setErrorDni(resultado.error || "No se encontró el DNI.");
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
                {/* <p className={`${eventStyle.eventFormDesc} text-white-500 mt-1`}>
                  Digita tu DNI y presiona la lupa para buscar tus datos en RENIEC de forma automática.
                </p> */}

                <div className="pt-10">
                  <form onSubmit={handleSubmitRegistro} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* BUSCADOR DE DNI */}
                      <div>
                        <span className="text-md text-white">
                          1. Ingresa tu DNI y se completarán automáticamente tu nombre y apellidos al presionar la lupa.
                        </span>
                        <hr className="border-t border-[#33b5e7] mt-2 mb-6"></hr>
                        <label className="block text-xs font-bold uppercase mb-1">
                          DNI (Buscar) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="dni"
                            // required
                            maxLength={8}
                            value={dni}
                            // onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ""))}
                            onChange={(e) => {
                              setDni(e.target.value.replace(/[^0-9]/g, ""));
                              setErrorDni("");
                              limpiarError("dni");
                            }}
                            className={`w-full border px-3 py-2 text-sm focus:outline-none ${errores.dni
                              ? "border-red-500"
                              : "border-gray-300 focus:border-[#1b1c54]"
                              }`}
                            placeholder="8 dígitos"

                          />
                          <button
                            type="button"
                            onClick={handleBuscarDni}
                            disabled={buscando}
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
                        {(errorDni || errores.dni) && (
                          <p className="text-red-500 text-[11px] mt-1 font-medium">
                            {errores.dni || errorDni}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombres */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          // required
                          value={nombre}
                          onChange={(e) => {
                            setNombre(e.target.value);
                            limpiarError("nombre");
                          }}
                          readOnly={nombre.length > 0}
                          className={`w-full border px-3 py-2 text-sm focus:outline-none ${!nombre && errores.nombre
                            ? "border-red-500 bg-red-50"
                            : nombre.length > 0
                              ? "bg-gray-50 border-gray-200 text-gray-600 font-medium"
                              : "border-gray-300 focus:border-[#1b1c54]"
                            }`}
                          placeholder="Se auto-completa al buscar tu DNI"
                        />
                        {errores.nombre && (
                          <p className="text-red-500 text-[11px] mt-1 font-medium">
                            {errores.nombre}
                          </p>
                        )}
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Apellidos <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="apellido"
                          // required
                          value={apellido}
                          onChange={(e) => {
                            setApellido(e.target.value);
                            limpiarError("apellido");
                          }}
                          readOnly={apellido.length > 0}
                          className={`w-full border px-3 py-2 text-sm focus:outline-none ${!apellido && errores.apellido
                            ? "border-red-500 bg-red-50"
                            : apellido.length > 0
                              ? "bg-gray-50 border-gray-200 text-gray-600 font-medium"
                              : "border-gray-300 focus:border-[#1b1c54]"
                            }`}
                          placeholder="Se auto-completa al buscar tu DNI"
                        />
                        {errores.apellido && (
                          <p className="text-red-500 text-[11px] mt-1 font-medium">
                            {errores.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-md text-white mt-12 mb-0 block">
                      2. Dejanos tus datos de contacto para mantenerte informado de futuras capacitaciones.
                    </span>
                    <hr className="border-t border-[#33b5e7] mt-2 mb-6"></hr>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Correo */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          name="correo"
                          value={correo}
                          onChange={(e) => {
                            setCorreo(e.target.value);
                            limpiarError("correo");
                          }}
                          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#1b1c54]"
                          placeholder="ejemplo@correo.com"
                        />
                      </div>

                      {/* Celular */}
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">
                          Celular <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          // required
                          value={telefono}
                          onChange={(e) => {
                            setTelefono(e.target.value.replace(/[^0-9]/g, ""));
                            limpiarError("telefono");
                          }}
                          className={`w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none ${errores.telefono
                            ? "border-red-500"
                            : "border-gray-300 focus:border-[#1b1c54]"
                            }`}
                          placeholder="Ej: 987654321"
                        />
                        {errores.telefono && (
                          <p className="text-red-500 text-[11px] mt-1 font-medium">
                            {errores.telefono}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* UBICACIÓN DINÁMICA DE SUPABASE */}
                    <div className="">
                      <span className="text-md text-white mt-12 block">
                        3. Selecciona primero tu departamento, luego provincia y finalmente distrito en ese orden.
                      </span>
                      <hr className="border-t border-[#33b5e7] mt-2 mb-6"></hr>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* DEPARTAMENTO */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                            Departamento <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="departamento"
                            value={seleccion.departamento}
                            onChange={(e) => {
                              handleCambioDepartamento(e.target.value);
                              limpiarError("departamento");
                            }}
                            className={`w-full border rounded px-3 py-1.5 text-sm bg-white focus:outline-none ${errores.departamento
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 focus:border-[#1b1c54]"
                              }`}
                          >
                            <option value="">-- Selecciona tu departamento --</option>
                            {listas.departamentos.map((dep) => (
                              <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                            ))}
                          </select>

                          {errores.departamento && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">
                              {errores.departamento}
                            </p>
                          )}
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
                            onChange={(e) => {
                              handleCambioProvincia(e.target.value);
                              limpiarError("provincia");
                            }}
                            className={`w-full border rounded px-3 py-1.5 text-sm bg-white focus:outline-none ${errores.provincia
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 focus:border-[#1b1c54]"
                              }`}
                          >
                            <option value="">-- Primero selecciona tu departamento --</option>
                            {listas.provincias.map((prov) => (
                              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                            ))}
                          </select>

                          {errores.provincia && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">
                              {errores.provincia}
                            </p>
                          )}
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
                            onChange={(e) => {
                              setSeleccion(prev => ({
                                ...prev,
                                distrito: e.target.value
                              }));

                              limpiarError("distrito");
                            }}
                            className={`w-full border rounded px-3 py-1.5 text-sm bg-white focus:outline-none ${errores.distrito
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 focus:border-[#1b1c54]"
                              }`}
                          >
                            <option value="">-- Primero selecciona tu provincia --</option>
                            {listas.distritos.map((dist) => (
                              <option key={dist.id} value={dist.id}>{dist.nombre}</option>
                            ))}
                          </select>

                          {errores.distrito && (
                            <p className="text-red-500 text-[11px] mt-1 font-medium">
                              {errores.distrito}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {errorFormulario && (
                      <p className="text-red-500 text-xs font-bold bg-red-200 p-3 border border-red-300 rounded text-center">
                        ⚠️ {errorFormulario}
                      </p>
                    )}

                    {/* BOTÓN DE CONFIRMACIÓN */}
                    <button
                      type="submit"
                      disabled={guardando}
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