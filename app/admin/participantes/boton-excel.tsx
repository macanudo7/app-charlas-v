"use client";

import ExcelJS from "exceljs";

interface BotonExcelProps {
  data: any[];
}

export default function BotonExportarExcel({ data }: BotonExcelProps) {
  const exportarAExcel = async () => {
    if (data.length === 0) return;

    // 1. Crear el libro y la hoja de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Participantes");

    // 2. Definir las columnas, sus cabeceras y sus llaves correspondientes
    worksheet.columns = [
      { header: "DNI", key: "dni", width: 12 },
      { header: "PARTICIPANTE", key: "participante", width: 35 },
      { header: "CAPACITACIÓN (SLUG)", key: "slug", width: 25 },
      { header: "EMAIL", key: "email", width: 30 },
      { header: "TELÉFONO", key: "telefono", width: 15 },
      { header: "CÓMO SE ENTERÓ", key: "comoTeEnteraste", width: 18 },
      { header: "DEPARTAMENTO", key: "departamento", width: 18 },
      { header: "PROVINCIA", key: "provincia", width: 18 },
      { header: "DISTRITO", key: "distrito", width: 18 },
      { header: "FECHA DE REGISTRO", key: "fecha", width: 25 },
    ];

    // 3. Insertar los datos formateados fila por fila
    data.forEach((item) => {
      worksheet.addRow({
        dni: item.dni,
        participante: `${item.apellido || ""}, ${item.nombre || ""}`.toUpperCase(),
        slug: item.charlaSlug || "-",
        email: item.correo || "Sin correo",
        telefono: item.telefono || "Sin teléfono",
        comoTeEnteraste: item.comoTeEnteraste || "-",
        departamento: item.departamento || "-",
        provincia: item.provincia || "-",
        distrito: item.distrito || "-",
        fecha: item.fechaInscripcion
          ? new Date(item.fechaInscripcion).toLocaleString("es-PE", {
              timeZone: "America/Lima",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "-",
      });
    });

    // 4. 🎨 ESTILIZAR LA FILA DE CABECERAS (Fila 1)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 26; // Altura de la cabecera para que respire

    headerRow.eachCell((cell) => {
      // Configurar el color de fondo personalizado
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        // ⚠️ IMPORTANTE: Usa formato ARGB. Los dos primeros caracteres 'FF' controlan la opacidad,
        // seguidos del código HEX tradicional (ejemplo: 008B9B para un tono cian/azul oscuro)
        fgColor: { argb: "FF008B9B" }, 
      };

      // Configurar la fuente del texto
      cell.font = {
        name: "Arial",
        color: { argb: "FFFFFFFF" }, // Texto Blanco
        bold: true,
        size: 10,
      };

      // Centrar el texto vertical y horizontalmente
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // 5. Ajustar alineación a los datos del cuerpo (opcional)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell("dni").alignment = { horizontal: "center" };
        row.getCell("fecha").alignment = { horizontal: "center" };
      }
    });

    // 6. Generar el Buffer de descarga directo en el cliente
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    
    const fechaActual = new Date().toISOString().split("T")[0];
    anchor.download = `reporte_participantes_${fechaActual}.xlsx`;
    
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportarAExcel}
      disabled={data.length === 0}
      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider px-4 py-3 rounded shadow-sm transition-colors flex items-center gap-2"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Exportar Excel
    </button>
  );
}