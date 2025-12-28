import { AppDataSource } from "../config/configDb.js";
import { Inform } from "../entities/inform.entity.js";
import { DailyReport } from "../entities/dailyReport.entity.js";
import PDFDocument from "pdfkit";

const informRepository = AppDataSource.getRepository(Inform);
const reportRepository = AppDataSource.getRepository(DailyReport);

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

export async function getReportById(id) {
    return await reportRepository.findOneBy({ id: Number(id) });
}

// B. Obtener lista (SOLO IDs y Fechas, para generar URLs)
export async function listReports() {
    return await reportRepository.find({
        select: ["id", "fecha_reporte", "filename"], // ¡NO traemos pdf_data aquí para que sea rápido!
        order: { fecha_reporte: "DESC" }
    });
}


// C. Generar o Recuperar el de HOY
export async function generateDailyReport() {
    const hoy = new Date().toISOString().split('T')[0];
    
    // 1. Verificar si ya existe el reporte de hoy
    const existente = await reportRepository.findOneBy({ fecha_reporte: hoy });
    if (existente) return existente;

    // 2. Si no existe, buscamos los datos
    const logs = await informRepository.find({
        relations: ["user", "bike"], // Traemos las relaciones para sacar los IDs
        order: { fecha_hora: "DESC" }
    });

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            const newReport = reportRepository.create({
                fecha_reporte: hoy,
                filename: `Reporte_${hoy}.pdf`,
                pdf_data: pdfData
            });
            await reportRepository.save(newReport);
            resolve(newReport);
        });

        // --- DIBUJO DEL PDF DETALLADO ---
        
        // Título
        doc.fontSize(18).text(`Reporte Diario de Movimientos`, { align: 'center' });
        doc.fontSize(12).text(`Fecha: ${hoy}`, { align: 'center' });
        doc.moveDown();

        // Línea separadora
        doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        logs.forEach((log, index) => {
            // Preparamos los datos (validando que existan por si algo se borró)
            const hora = new Date(log.fecha_hora).toLocaleTimeString();
            const biciId = log.bike ? log.bike.id : "Eliminada";
            const userId = log.user ? log.user.id : "Eliminado";
            const userEmail = log.user_email_snapshot || "Sin email";
            const bicicletero = log.bicicletero_number;
            const nota = log.nota ? log.nota : "Sin nota";
            const estado = log.estado_nuevo.toUpperCase();

            // Dibujamos el bloque de información
            doc.fontSize(10).font('Helvetica-Bold');
            
            // Línea 1: Estado y Hora
            doc.fillColor(estado === 'INGRESADA' ? 'green' : 'blue');
            doc.text(`[${hora}] Estado: ${estado}`);
            
            // Línea 2: Datos Técnicos (IDs y Ubicación)
            doc.fillColor('black').font('Helvetica');
            doc.text(`Bicicletero: #${bicicletero}  |  Bici ID: ${biciId}  |  Usuario ID: ${userId}`);
            
            // Línea 3: Email del Usuario
            doc.text(`Usuario Email: ${userEmail}`);

            // Línea 4: Nota (Solo si hay nota distinta a "Sin nota" o vacía)
            if (nota !== "Sin nota" && nota !== "") {
                doc.font('Helvetica-Oblique').fillColor('gray');
                doc.text(`Nota: "${nota}"`);
            }

            // Separador entre registros
            doc.moveDown(0.5);
            doc.strokeColor('#cccccc').moveTo(30, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
        });
        
        // -------------------------------

        doc.end();
    });
}