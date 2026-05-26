'use server';

import { db } from "@/lib/db";
import { charlas, ubigeoPeruDepartments, ubigeoPeruProvinces, ubigeoPeruDistricts, participantes, inscripciones } from "@/lib/schema";
import { eq, desc, and, isNull } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// 1. 🔒 QUITAMOS EL 'export'. Ahora es una función interna de ayuda.
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "❌ ERROR CRÍTICO: Las variables de entorno de Supabase no están cargadas."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export interface ActionResponse {
  success: boolean;
  error?: string;
  mensaje?: string;
}

// export async function crearCharla(prevState: string | undefined, formData: FormData) {
//   let subidaExitosa = false;

//   try {
//     const nombreEvento = formData.get("nombreEvento") as string;
//     const slug = formData.get("slug") as string;
//     const fecha = formData.get("fecha") as string;
//     const tituloFormulario = formData.get("tituloFormulario") as string;

//     if (!nombreEvento || !slug || !fecha || !tituloFormulario) {
//       return "Por favor, completa todos los campos obligatorios.";
//     }

//     const uploadDir = join(process.cwd(), "public", "uploads");
//     await mkdir(uploadDir, { recursive: true });

//     // 1. PROCESAR IMAGEN: BANNER PRINCIPAL
//     const bannerFile = formData.get("banner") as File;
//     let bannerUrl = "";
//     if (bannerFile && bannerFile.size > 0) {
//       const bannerFilename = `${Date.now()}-banner-${bannerFile.name}`;
//       const bannerBuffer = Buffer.from(await bannerFile.arrayBuffer());
//       await writeFile(join(uploadDir, bannerFilename), bannerBuffer);
//       bannerUrl = `/uploads/${bannerFilename}`;
//     }

//     // 2. PROCESAR IMAGEN: FONDO DEL BANNER (NUEVO)
//     const fondoBannerFile = formData.get("fondoBanner") as File;
//     let fondoBannerUrl = "";
//     if (fondoBannerFile && fondoBannerFile.size > 0) {
//       const fondoFilename = `${Date.now()}-fondo-${fondoBannerFile.name}`;
//       const fondoBuffer = Buffer.from(await fondoBannerFile.arrayBuffer());
//       await writeFile(join(uploadDir, fondoFilename), fondoBuffer);
//       fondoBannerUrl = `/uploads/${fondoFilename}`;
//     }

//     // 3. PROCESAR ARRAY DE IMÁGENES: LOGOS ORGANIZADORES
//     const logoFiles = formData.getAll("logos") as File[];
//     const logosUrls: string[] = [];
//     const archivosValidos = logoFiles.filter(f => f.size > 0).slice(0, 9);

//     for (const logoFile of archivosValidos) {
//       const logoFilename = `${Date.now()}-logo-${logoFile.name}`;
//       const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
//       await writeFile(join(uploadDir, logoFilename), logoBuffer);
//       logosUrls.push(`/uploads/${logoFilename}`);
//     }

//     // GUARDAR EN POSTGRESQL
//     await db.insert(charlas).values({
//       nombreEvento,
//       slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
//       fecha: new Date(fecha),
//       tituloFormulario,
//       banner: bannerUrl,
//       fondoBanner: fondoBannerUrl, // Guardamos la ruta del fondo
//       logos: logosUrls,            // Guardamos el array de rutas de imágenes
//     });

//     subidaExitosa = true;
//   } catch (error: any) {
//     console.error("Error creando charla:", error);
//     if (error.code === "23505") {
//       return "La URL (slug) ya está siendo utilizada en otro evento.";
//     }
//     return "Error interno al guardar la charla.";
//   }

//   if (subidaExitosa) {
//     redirect("/admin");
//   }
// }

export async function crearCharla(
  prevState: ActionResponse | undefined, // Cambiado a un objeto structurado para mejor manejo de errores en la interfaz
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Extraer los campos de texto del formulario
    const nombreEvento = formData.get("nombreEvento") as string;
    const slug = formData.get("slug") as string;
    const fechaInput = formData.get("fecha") as string;
    const tituloFormulario = formData.get("tituloFormulario") as string;

    // Validaciones básicas del lado del servidor
    if (!nombreEvento || !slug || !fechaInput || !tituloFormulario) {
      return { success: false, error: "Todos los campos obligatorios deben estar llenos." };
    }

    const supabase = getSupabaseClient();

    // 2. Procesar el archivo del Banner
    const archivoBanner = formData.get("banner") as File | null;
    let urlBanner: string | null = null;

    if (archivoBanner && archivoBanner.size > 0 && archivoBanner.name !== "undefined") {
      // Limpiamos el nombre del archivo quitando caracteres raros y le añadimos un timestamp único
      const extension = archivoBanner.name.split('.').pop();
      const nombreLimpio = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
      const rutaArchivo = `banners/${nombreLimpio}`;

      // Convertimos el archivo a Buffer para el entorno Node.js de Vercel
      const bytes = await archivoBanner.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from('charlas')
        .upload(rutaArchivo, buffer, {
          contentType: archivoBanner.type,
          upsert: true
        });

      if (uploadError) {
        console.error("Error al subir banner:", uploadError);
        return { success: false, error: "Error al subir la imagen del banner corporativo." };
      }

      // Recuperamos la URL pública (ya que tu bucket ahora es Public)
      const { data } = supabase.storage.from('charlas').getPublicUrl(rutaArchivo);
      urlBanner = data.publicUrl;
    }

    // 3. Procesar el archivo de Fondo del Banner (Fondo Opcional)
    const archivoFondo = formData.get("fondoBanner") as File | null;
    let urlFondo: string | null = null;

    if (archivoFondo && archivoFondo.size > 0 && archivoFondo.name !== "undefined") {
      const extension = archivoFondo.name.split('.').pop();
      const nombreLimpio = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
      const rutaArchivo = `fondos/${nombreLimpio}`;

      const bytes = await archivoFondo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from('charlas', )
        .upload(rutaArchivo, buffer, {
          contentType: archivoFondo.type,
          upsert: true
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('charlas').getPublicUrl(rutaArchivo);
        urlFondo = data.publicUrl;
      }
    }

    // 4. Inserción limpia en PostgreSQL a través de Drizzle ORM
    await db.insert(charlas).values({
      nombreEvento,
      slug: slug.trim().toLowerCase(), // Aseguramos formato url limpia
      fecha: new Date(fechaInput),
      tituloFormulario,
      banner: urlBanner,       // Guardará null o la url de supabase: https://...
      fondoBanner: urlFondo,   // Guardará null o la url de supabase: https://...
      activo: true,
      logos: [] // Inicializa el json vacío según tu esquema
    });

    // 5. Rompemos la caché de Next.js para que el listado de charlas se actualice al instante
    revalidatePath("/charlas");

    return { success: true, mensaje: "La capacitación se ha creado y publicado exitosamente." };

  } catch (error: any) {
    console.error("Error crítico en crearCharla:", error);
    
    // Controlar si intentan duplicar un slug único en la BD (Error común en producción)
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return { success: false, error: "El slug ya está en uso. Elige un identificador de URL diferente." };
    }

    return { success: false, error: "Error interno del servidor al procesar la solicitud." };
  }
}

export async function consultarDni(dni: string) {
  if (!dni || dni.length !== 8) {
    return { success: false, error: "El DNI debe tener 8 dígitos." };
  }

  try {
    // REEMPLAZA AQUÍ con la URL real de tu proveedor y tu Token secreto
    const url = `https://api.decolecta.com/v1/reniec/dni?numero=${dni}`;
    const token = process.env.API_DNI_TOKEN; // Guardado seguro en tu .env de la Mac

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // Cacheamos por 1 hora por si el usuario borra y vuelve a escribir el DNI
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      return { success: false, error: "No se pudo conectar con el servicio de Reniec." };
    }

    const data = await response.json();

    console.log("=== RESPUESTA DE TU API DE DNI ===", data);

    // Mapeamos la respuesta según lo que te devuelva tu API externa
    // (Por lo general devuelven: nombres, apellidoPaterno, apellidoMaterno)
    // MODIFICADO PARA TU API REAL (Cristian Romel Flores Conde 🚀)
    if (data && data.first_name) {
      return {
        success: true,
        nombre: data.first_name, // 'CRISTIAN ROMEL'
        apellido: `${data.first_last_name} ${data.second_last_name}`.trim() // 'FLORES CONDE'
      };
    }

    return { success: false, error: "DNI no encontrado en el padrón." };

  } catch (error) {
    console.error("Error consultando DNI externo:", error);
    return { success: false, error: "Error interno al consultar el documento." };
  }
}

// 1. Traer todos los departamentos
export async function obtenerDepartamentos() {
  return await db
    .select({ id: ubigeoPeruDepartments.id, nombre: ubigeoPeruDepartments.name })
    .from(ubigeoPeruDepartments);
}

// 2. Traer provincias según el departamento seleccionado
export async function obtenerProvinciasPorDepartamento(departamentoId: string) {
  if (!departamentoId) return [];
  return await db
    .select({ id: ubigeoPeruProvinces.id, nombre: ubigeoPeruProvinces.name })
    .from(ubigeoPeruProvinces)
    .where(eq(ubigeoPeruProvinces.departmentId, departamentoId));
}

// 3. Traer distritos según la provincia seleccionada
export async function obtenerDistritosPorProvincia(provinciaId: string) {
  if (!provinciaId) return [];
  return await db
    .select({ id: ubigeoPeruDistricts.id, nombre: ubigeoPeruDistricts.name })
    .from(ubigeoPeruDistricts)
    .where(eq(ubigeoPeruDistricts.provinceId, provinciaId));
}

export async function registrarParticipante(data: {
  dni: string;
  nombre: string;
  apellido: string;
  correo?: string;
  area?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  slug: string;
}) {
  // 1. Validaciones básicas de seguridad del lado del servidor
  if (!data.dni || data.dni.length !== 8) {
    return { success: false, error: "El DNI es obligatorio y debe tener 8 dígitos." };
  }
  if (!data.nombre || !data.apellido) {
    return { success: false, error: "El nombre y apellido son obligatorios." };
  }
  if (!data.departamento || !data.provincia || !data.distrito) {
    return { success: false, error: "Debes seleccionar tu Departamento, Provincia y Distrito obligatoriamente." };
  }

  try {

    console.log(data); 
    // 🚀 NUEVO: Buscar el ID real de la charla usando el slug directamente en el servidor
    const [charlaReal] = await db
      .select({ id: charlas.id })
      .from(charlas)
      .where(eq(charlas.slug, data.slug))
      .limit(1);

    

    if (!charlaReal) {
      return { success: false, error: "La capacitación seleccionada no existe o fue dada de baja." };
    }


    // 2. Buscar si el participante ya existe en la base de datos por su DNI
    let [participante] = await db
      .select()
      .from(participantes)
      .where(eq(participantes.dni, data.dni))
      .limit(1);

    if (!participante) {
      // Si NO existe, lo creamos con los datos del formulario
      const [nuevoParticipante] = await db.insert(participantes).values({
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo || null,
        area: data.area || null,
        departamento: data.departamento || null,
        provincia: data.provincia || null,
        distrito: data.distrito || null,
      }).returning();
      
      participante = nuevoParticipante;
    } else {
      // 🔄 Si SÍ existe, actualizamos sus datos por si cambió de correo o dirección
      await db
        .update(participantes)
        .set({
          correo: data.correo || participante.correo,
          departamento: data.departamento || participante.departamento,
          provincia: data.provincia || participante.provincia,
          distrito: data.distrito || participante.distrito,
          area: data.area || participante.area,
        })
        .where(eq(participantes.id, participante.id));
    }

    // 3. Verificar si YA está inscrito específicamente en ESTA charla
    const [yaInscrito] = await db
      .select()
      .from(inscripciones)
      .where(
        and(
          eq(inscripciones.charlaId, charlaReal.id), // Usamos el ID seguro que encontramos arriba
          eq(inscripciones.participanteId, participante.id)
        )
      )
      .limit(1);

    if (yaInscrito) {
      return { success: false, error: "Ya te encuentras registrado en esta capacitación." };
    }

    // 4. Insertar la inscripción correspondiente en la tabla relacional
    await db.insert(inscripciones).values({
      charlaId: charlaReal.id, // Garantizado que no será null
      participanteId: participante.id,
    });

    return { success: true };

  } catch (error) {
    console.error("Error en registro relacional:", error);
    return { success: false, error: "Error interno al procesar la inscripción." };
  }
}

export async function obtenerParticipantes(charlaId?: string) {
  try {
    // 1. Iniciamos la query desde la tabla relacional 'inscripciones'
    const query = db
      .select({
        id: participantes.id, // ID del participante
        dni: participantes.dni,
        nombre: participantes.nombre,
        apellido: participantes.apellido,
        correo: participantes.correo,
        area: participantes.area,
        departamento: participantes.departamento,
        provincia: participantes.provincia,
        distrito: participantes.distrito,
        // 🚀 NUEVOS CAMPOS DESDE EL JOIN
        fechaInscripcion: inscripciones.fechaInscripcion,
        charlaId: inscripciones.charlaId,
        charlaSlug: charlas.slug, // El slug que necesitas para la columna
        charlaNombre: charlas.nombreEvento // Por si quieres pintar el nombre largo
      })
      .from(inscripciones)
      // 2. Unimos con participantes
      .innerJoin(participantes, eq(inscripciones.participanteId, participantes.id))
      // 3. Unimos con charlas para sacar el slug
      .innerJoin(charlas, eq(inscripciones.charlaId, charlas.id));

    // 4. Si el administrador seleccionó una charla específica en el filtro
    if (charlaId && charlaId !== "todos") {
      query.where(eq(inscripciones.charlaId, Number(charlaId)));
    }

    // Ordenamos por la inscripción más reciente a la capacitación
    return await query.orderBy(desc(inscripciones.fechaInscripcion));

  } catch (error) {
    console.error("Error al obtener participaciones de la BD:", error);
    return [];
  }
}

// La función obtenerCharlasSelect se queda exactamente igual que antes 👍
export async function obtenerCharlasSelect() {
  try {
    return await db
      .select({ id: charlas.id, nombre: charlas.nombreEvento })
      .from(charlas);
  } catch (error) {
    console.error("Error al obtener charlas:", error);
    return [];
  }
}

export async function obtenerEventoPorSlug(slug: string) {
  try {
    const [evento] = await db
      .select()
      .from(charlas)
      .where(eq(charlas.slug, slug))
      .limit(1);
      
    return evento || null;
  } catch (error) {
    console.error("Error al buscar el evento:", error);
    return null;
  }
}