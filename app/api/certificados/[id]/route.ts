import { NextResponse } from "next/server";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import JSZip from "jszip";

import fs from "fs";
import path from "path";

import { db } from "@/lib/db";

import { participantes, inscripciones, charlas } from "@/lib/schema";

import { eq } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    try {

        const { id } = await params;

        const charlaId = Number(id);

        // TRAER CHARLA
        const charla = await db.query.charlas.findFirst({
            where: eq(charlas.id, charlaId),
        });

        if (!charla) {
            return NextResponse.json(
                { error: "Charla no encontrada" },
                { status: 404 }
            );
        }

        // TRAER PARTICIPANTES
        const inscritos = await db
            .select({
                nombre: participantes.nombre,
                apellido: participantes.apellido,
            })
            .from(inscripciones)
            .innerJoin(
                participantes,
                eq(inscripciones.participanteId, participantes.id)
            )
            .where(eq(inscripciones.charlaId, charlaId));

        inscritos.sort((a, b) => {
            const nombreA = `${a.apellido} ${a.nombre}`.toLowerCase();
            const nombreB = `${b.apellido} ${b.nombre}`.toLowerCase();

            return nombreA.localeCompare(nombreB, "es");
        });


        // LEER PLANTILLA
        const plantillaPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            "certificados",
            "certificado-test.jpg"
        );

        const plantillaBytes = fs.readFileSync(plantillaPath);

        // ZIP FINAL
        // const zip = new JSZip();
        //Macanudo Team  2

        // CREAR UN SOLO PDF
        const pdfDoc = await PDFDocument.create();

        // EMBEBER IMAGEN (Comentado para generarlo sin fondo)
        // const plantillaImage = await pdfDoc.embedJpg(plantillaBytes);

        // FUENTE
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);


        // GENERAR 1 PDF CON TODOS LOS CERTIFICADOS
        for (const participante of inscritos) {

            // Crear PDF
            // const pdfDoc = await PDFDocument.create();

            // Crear página
            const page = pdfDoc.addPage([1200, 850]);

            // Embed imagen plantilla
            // const plantillaImage = await pdfDoc.embedJpg(plantillaBytes);

            // Fondo
            // page.drawImage(plantillaImage, {
            //     x: 0,
            //     y: 0,
            //     width: 1200,
            //     height: 850,
            // });

            // Fuente
            // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Nombre completo
            const nombreCompleto =
                `${participante.nombre} ${participante.apellido}`;

            // Centrar nombre para el eje X
            const fontSize = 25;

            const textWidth = font.widthOfTextAtSize(
                nombreCompleto,
                fontSize
            );

            const pageWidth = page.getWidth();
            const x = (pageWidth - textWidth) / 2;

            // Nombre de los participantes en cada certificado
            page.drawText(nombreCompleto, {
                x,
                y: 420,
                size: fontSize,
                font,
                color: rgb(0.1, 0.1, 0.1),
            });

            // NOMBRE EVENTO
            // const eventoSize = 18;

            // const eventoWidth = font.widthOfTextAtSize(
            //     charla.nombreEvento,
            //     eventoSize
            // );

            // const eventoX = (page.getWidth() - eventoWidth) / 2;

            // page.drawText(charla.nombreEvento, {
            //     x: eventoX,
            //     y: 330,
            //     size: 22,
            //     font,
            //     color: rgb(0.2, 0.2, 0.2),
            // });

            // // FECHA
            // const fecha = new Date(charla.fecha)
            //     .toLocaleDateString("es-PE");

            // page.drawText(fecha, {
            //     x: 350,
            //     y: 195,
            //     size: 18,
            //     font,
            //     color: rgb(0.3, 0.3, 0.3),
            // });

            // Guardar PDF
            // const pdfBytes = new Uint8Array(await pdfDoc.save());

            // Nombre archivo
            // const nombreArchivo =
            //     `${nombreCompleto}.pdf`;

            // // Agregar al ZIP
            // zip.file(nombreArchivo, pdfBytes);
        }

        // GENERAR ZIP
        // const zipBuffer = await zip.generateAsync({
        //     type: "nodebuffer",
        // });

        // Guardar PDF
        const pdfBytes = await pdfDoc.save();

        // RESPUESTA DESCARGA
        return new Response(pdfBytes as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    `attachment; filename="certificados-${charla.slug}.pdf"`
            },
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            { error: "Error al generar certificados" },
            { status: 500 }
        );
    }
}