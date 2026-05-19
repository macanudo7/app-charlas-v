'use server';

import { db } from "@/lib/db";
import { charlas } from "@/lib/schema";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "path";

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