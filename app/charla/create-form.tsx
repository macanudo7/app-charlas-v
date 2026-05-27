'use client';

import { crearCharla, obtenerDepartamentos, obtenerProvinciasPorDepartamento } from "@/lib/actions";
import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

// 📝 Interfaz para tipar los elementos de Ubigeo
interface UbigeoItem {
  id: string;
  nombre: string;
}

export default function CreateCharlaForm() {
  const [state, dispatch] = useActionState(crearCharla, undefined);
  const [logoCount, setLogoCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // 🚀 ESTADOS PARA EL UBIGEO DINÁMICO DEL LUGAR DEL EVENTO
  const [listasLugar, setListasLugar] = useState<{
    departamentos: UbigeoItem[];
    provincias: UbigeoItem[];
  }>({ departamentos: [], provincias: [] });

  const [seleccionLugar, setSeleccionLugar] = useState({
    departamentoId: "",
    provinciaId: ""
  });

  // 1. 🌍 Cargar departamentos al montar el componente administrativo
  useEffect(() => {
    obtenerDepartamentos().then((data) => {
      setListasLugar(prev => ({ ...prev, departamentos: data }));
    });
  }, []);

  // 2. 🔄 Manejar el cambio de departamento para actualizar las provincias
  const handleCambioDepartamento = async (idDep: string) => {
    setSeleccionLugar({ departamentoId: idDep, provinciaId: "" });
    setListasLugar(prev => ({ ...prev, provincias: [] }));

    if (idDep) {
      const provs = await obtenerProvinciasPorDepartamento(idDep);
      setListasLugar(prev => ({ ...prev, provincias: provs }));
    }
  };

  // ✨ Si todo sale bien, limpiamos los campos de forma segura (Ya no dará error setSeleccionLugar)
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setSeleccionLugar({ departamentoId: "", provinciaId: "" });
      if (logoCount > 0) {
        setLogoCount(0);
      }
    }
  }, [state, logoCount]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > 9) {
        alert("Solo se permite un máximo de 9 logos organizadores.");
        e.target.value = "";
        setLogoCount(0);
      } else {
        setLogoCount(files.length);
      }
    }
  };

  return (
    <form ref={formRef} action={dispatch} encType="multipart/form-data" className="space-y-6 p-4">
      
      {/* 🛑 Mensaje de error */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm font-medium">
          {state.error}
        </div>
      )}

      {/* 🎉 Mensaje de éxito */}
      {state?.mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm font-medium">
          {state.mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Evento */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Nombre del Evento <span>*</span>
          </label>
          <input
            type="text" name="nombreEvento" required
            className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54]"
            placeholder="Ej: Capacitación Planta Yura 2026"
          />
        </div>

        {/* URL / Slug */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            URL del Evento (Slug) <span>*</span>
          </label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              charlas.yura.com.pe/
            </span>
            <input
              type="text" name="slug" required
              className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54]"
              placeholder="seguridad-planta-yura"
            />
          </div>
        </div>

        {/* Fecha del Evento */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Fecha y Hora del Evento <span>*</span>
          </label>
          <input
            type="datetime-local" name="fecha" required
            className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54]"
          />
        </div>

        {/* Título del Formulario */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Título sobre el Formulario <span>*</span>
          </label>
          <input
            type="text" name="tituloFormulario" required
            className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54]"
            placeholder="Ej: Inscríbete ingresando tus datos"
          />
        </div>

        {/* 🚀 DEPARTAMENTO DEL LUGAR DEL EVENTO */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Departamento (Lugar del Evento) <span className="text-red-500">*</span>
          </label>
          <select
            name="departamentoLugar"
            required
            value={seleccionLugar.departamentoId}
            onChange={(e) => handleCambioDepartamento(e.target.value)}
            className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54] bg-white"
          >
            <option value="">-- Seleccione --</option>
            {listasLugar.departamentos.map((dep) => (
              <option key={dep.id} value={dep.id}>{dep.nombre}</option>
            ))}
          </select>
        </div>

        {/* 🚀 PROVINCIA DEL LUGAR DEL EVENTO */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Provincia (Lugar del Evento) <span className="text-red-500">*</span>
          </label>
          <select
            name="provinciaLugar"
            required
            value={seleccionLugar.provinciaId}
            disabled={!seleccionLugar.departamentoId}
            onChange={(e) => setSeleccionLugar(prev => ({ ...prev, provinciaId: e.target.value }))}
            className="w-full border border-gray-300 text-sm p-2 focus:outline-none focus:border-[#1b1c54] bg-white disabled:bg-gray-100"
          >
            <option value="">-- Seleccione --</option>
            {listasLugar.provincias.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </div>

        {/* Banner del Evento (Imagen Principal) */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Banner del Evento <span>*</span> <span>(Imagen sin fondo en .png, en proporción 1:1 idealmente)</span>
          </label>
          <input
            type="file" name="banner" accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        {/* Imagen de Fondo del Banner */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">
            Imagen de Fondo para el Banner <span></span> <span>(Opcional, por defecto usará un fondo de cemento)</span>
          </label>
          <input
            type="file" name="fondoBanner" accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>
      </div>

      {/* Logos de Organizadores */}
      <div className="pt-2">
        <label className="block text-xs font-bold uppercase mb-2">
          Logos de Organizadores (Máx 9) <span></span> <span>(Opcional, incluye por defecto el logo de Yura, seleccionar las imágenes en .png de forma agrupada)</span>
        </label>
        <input
          type="file" name="logos" multiple accept="image/*" onChange={handleLogoChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1b1c54] hover:file:bg-blue-100"
        />
        <p className="mt-2 text-xs text-gray-500">
          Archivos seleccionados: <span className="font-bold text-[#1b1c54]">{logoCount} de 9</span>
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 border-t pt-6">
        <a href="/admin" className="px-5 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
          Cancelar
        </a>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit" disabled={pending}
      className="bg-[#1b1c54] hover:bg-[#252774] text-white px-6 py-2 text-sm font-semibold tracking-wide shadow disabled:bg-gray-400 transition-all"
    >
      {pending ? "Creando evento..." : "Crear Evento"}
    </button>
  );
}