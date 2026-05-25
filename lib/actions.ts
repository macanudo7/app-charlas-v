'use server';

import { db } from "@/lib/db";
import { charlas, ubigeoPeruDepartments, ubigeoPeruProvinces, ubigeoPeruDistricts, participantes, inscripciones } from "@/lib/schema";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "path";
import { eq, desc, and, isNull } from 'drizzle-orm';

export async function crearCharla(prevState: string | undefined, formData: FormData) {
  let subidaExitosa = false;

  try {
    const nombreEvento = formData.get("nombreEvento") as string;
    const slug = formData.get("slug") as string;
    const fecha = formData.get("fecha") as string;
    const tituloFormulario = formData.get("tituloFormulario") as string;

    if (!nombreEvento || !slug || !fecha || !tituloFormulario) {
      return "Por favor, completa todos los campos obligatorios.";
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 1. PROCESAR IMAGEN: BANNER PRINCIPAL
    const bannerFile = formData.get("banner") as File;
    let bannerUrl = "";
    if (bannerFile && bannerFile.size > 0) {
      const bannerFilename = `${Date.now()}-banner-${bannerFile.name}`;
      const bannerBuffer = Buffer.from(await bannerFile.arrayBuffer());
      await writeFile(join(uploadDir, bannerFilename), bannerBuffer);
      bannerUrl = `/uploads/${bannerFilename}`;
    }

    // 2. PROCESAR IMAGEN: FONDO DEL BANNER (NUEVO)
    const fondoBannerFile = formData.get("fondoBanner") as File;
    let fondoBannerUrl = "";
    if (fondoBannerFile && fondoBannerFile.size > 0) {
      const fondoFilename = `${Date.now()}-fondo-${fondoBannerFile.name}`;
      const fondoBuffer = Buffer.from(await fondoBannerFile.arrayBuffer());
      await writeFile(join(uploadDir, fondoFilename), fondoBuffer);
      fondoBannerUrl = `/uploads/${fondoFilename}`;
    }

    // 3. PROCESAR ARRAY DE IMÁGENES: LOGOS ORGANIZADORES
    const logoFiles = formData.getAll("logos") as File[];
    const logosUrls: string[] = [];
    const archivosValidos = logoFiles.filter(f => f.size > 0).slice(0, 9);

    for (const logoFile of archivosValidos) {
      const logoFilename = `${Date.now()}-logo-${logoFile.name}`;
      const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
      await writeFile(join(uploadDir, logoFilename), logoBuffer);
      logosUrls.push(`/uploads/${logoFilename}`);
    }

    // GUARDAR EN POSTGRESQL
    await db.insert(charlas).values({
      nombreEvento,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
      fecha: new Date(fecha),
      tituloFormulario,
      banner: bannerUrl,
      fondoBanner: fondoBannerUrl, // Guardamos la ruta del fondo
      logos: logosUrls,            // Guardamos el array de rutas de imágenes
    });

    subidaExitosa = true;
  } catch (error: any) {
    console.error("Error creando charla:", error);
    if (error.code === "23505") {
      return "La URL (slug) ya está siendo utilizada en otro evento.";
    }
    return "Error interno al guardar la charla.";
  }

  if (subidaExitosa) {
    redirect("/admin");
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