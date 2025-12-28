import { AppDataSource } from "../config/configDb.js";
import { Inform } from "../entities/inform.entity.js";
import PDFDocument from "pdfkit";

const informRepository = AppDataSource.getRepository(Inform);

// 1. Guardar en el historial (Se llama desde el Trigger)
export async function createInformLog(reserve, note = "") {
    try {
        const newLog = informRepository.create({
            bicicletero_number: reserve.bicicletero ? reserve.bicicletero.number : null,
            estado_nuevo: reserve.estado,
            user: reserve.user,
            user_email_snapshot: reserve.user.email,
            bike: reserve.bike,
            nota: note || "Sin nota"
        });

        await informRepository.save(newLog);
        console.log("Log de informe creado con éxito.");
    } catch (error) {
        console.error("Error creando log de informe:", error);
    }
}

// 2. Generar PDF
export async function generateInformPdf(res) {
    // Buscar datos
    const logs = await informRepository.find({
        relations: ["user", "bike"],
        order: { fecha_hora: "DESC" }
    });

    const doc = new PDFDocument({ margin: 30, layout: 'landscape' });

    // --- EL TRUCO ESTÁ AQUÍ ---
    res.setHeader('Content-Type', 'application/pdf');
    // 'inline' le dice al navegador: "Ábrelo aquí mismo", no lo descargues.
    res.setHeader('Content-Disposition', 'inline; filename=informe_movimientos.pdf');

    // Conectamos el PDF directamente a la respuesta del usuario
    doc.pipe(res);

    // --- TU LÓGICA DE DIBUJO (La misma de siempre) ---
    doc.fontSize(20).text("Informe Histórico de Movimientos", { align: "center" });
    doc.moveDown();

    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text("Fecha", 30, y);
    doc.text("Bicicletero", 130, y);
    doc.text("Estado", 200, y);
    doc.text("Usuario", 280, y);
    doc.text("Bici ID", 480, y);
    doc.text("Nota", 530, y);
    doc.moveTo(30, y + 15).lineTo(750, y + 15).stroke();
    y += 25;
    doc.font('Helvetica').fontSize(9);

    logs.forEach((log) => {
        if (y > 550) { doc.addPage({ layout: 'landscape' }); y = 30; }
        const fecha = new Date(log.fecha_hora).toLocaleString();
        
        if (log.estado_nuevo === 'ingresada') doc.fillColor('green');
        else if (log.estado_nuevo === 'entregada') doc.fillColor('blue');
        else doc.fillColor('black');

        doc.text(fecha, 30, y);
        doc.text(log.bicicletero_number || "-", 130, y);
        doc.text(log.estado_nuevo, 200, y);
        doc.fillColor('black');
        doc.text(log.user_email_snapshot || "N/A", 280, y);
        doc.text(log.bike ? `${log.bike.brand} ${log.bike.model}` : "Eliminada", 480, y);
        doc.text(log.nota || "-", 530, y);
        
        y += 20;
    });
    // ------------------------------------------------

    // Cerramos el documento y se envía automáticamente
    doc.end();
}