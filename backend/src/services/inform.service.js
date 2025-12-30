import { AppDataSource } from "../config/configDb.js";
import { Inform } from "../entities/inform.entity.js";
import { DailyReport } from "../entities/dailyReport.entity.js";
import PDFDocument from "pdfkit";

const informRepository = AppDataSource.getRepository(Inform);
const dailyReportRepository = AppDataSource.getRepository(DailyReport);

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
    return await dailyReportRepository.findOneBy({ id: Number(id) });
}

export async function listReports() {
    return await dailyReportRepository.find({
        select: ["id", "fecha_reporte", "filename"], 
        order: { fecha_reporte: "DESC" }
    });
}


function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

export async function generateDailyReport() {
    const hoy = new Date().toISOString().split('T')[0];
    const existente = await dailyReportRepository.findOneBy({ fecha_reporte: hoy });
    if (existente) {
        return existente; 
    }

    const ayer = getYesterdayDate();
    const startOfToday = new Date(hoy + 'T00:00:00.000Z');
    
    const logs = await informRepository
        .createQueryBuilder("inform")
        .leftJoinAndSelect("inform.user", "user")
        .leftJoinAndSelect("inform.bike", "bike")
        .where("inform.fecha_hora >= :startOfToday", { startOfToday })
        .orderBy("inform.fecha_hora", "DESC")
        .getMany();

    if (logs.length === 0) {
        const startOfYesterday = new Date(ayer + 'T00:00:00.000Z');
        const endOfYesterday = new Date(ayer + 'T23:59:59.999Z');
        
        const logsYesterday = await informRepository
            .createQueryBuilder("inform")
            .leftJoinAndSelect("inform.user", "user")
            .leftJoinAndSelect("inform.bike", "bike")
            .where("inform.fecha_hora >= :start", { start: startOfYesterday })
            .andWhere("inform.fecha_hora <= :end", { end: endOfYesterday })
            .orderBy("inform.fecha_hora", "DESC")
            .getMany();
        
        if (logsYesterday.length > 0) {
            const informeAyer = await dailyReportRepository.findOneBy({ fecha_reporte: ayer });
            if (!informeAyer) {
                return await generateReportForDate(ayer, logsYesterday);
            }
        }
        
        return await generateEmptyReport(hoy);
    }

    return await generateReportForDate(hoy, logs);
}

async function generateReportForDate(fecha, logs) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        
        doc.on('end', async () => {
            try {
                const pdfData = Buffer.concat(buffers);
                
                const existingReport = await dailyReportRepository.findOneBy({ fecha_reporte: fecha }); 
                if (existingReport) {
                    existingReport.pdf_data = pdfData;
                    await dailyReportRepository.save(existingReport);
                    resolve(existingReport);
                } else {
                    const newReport = dailyReportRepository.create({
                        fecha_reporte: fecha,
                        filename: `Reporte_${fecha}.pdf`,
                        pdf_data: pdfData
                    });
                    await dailyReportRepository.save(newReport);
                    resolve(newReport);
                }
            } catch (error) {
                reject(error);
            }
        });

        doc.on('error', reject);
        doc.fontSize(18).text(`Reporte Diario de Movimientos`, { align: 'center' });
        doc.fontSize(12).text(`Fecha: ${fecha}`, { align: 'center' });
        doc.moveDown();
        doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        if (logs.length === 0) {
            doc.fontSize(12).text("No hubo movimientos en esta fecha.", { align: 'center' });
        } else {
            logs.forEach((log, index) => {
                const hora = new Date(log.fecha_hora).toLocaleTimeString();
                const biciId = log.bike ? log.bike.id : "Eliminada";
                const userId = log.user ? log.user.id : "Eliminado";
                const userEmail = log.user_email_snapshot || "Sin email";
                const bicicletero = log.bicicletero_number;
                const nota = log.nota ? log.nota : "Sin nota";
                const estado = log.estado_nuevo.toUpperCase();

                doc.fontSize(10).font('Helvetica-Bold');
                doc.fillColor(estado === 'INGRESADA' ? 'green' : (estado === 'ENTREGADA' ? 'blue' : 'red'));
                doc.text(`[${hora}] Estado: ${estado}`);
                doc.fillColor('black').font('Helvetica');
                doc.text(`Bicicletero: #${bicicletero}  |  Bici ID: ${biciId}  |  Usuario ID: ${userId}`);
                doc.text(`Usuario Email: ${userEmail}`);
                if (nota !== "Sin nota" && nota !== "") {
                    doc.font('Helvetica-Oblique').fillColor('gray');
                    doc.text(`Nota: "${nota}"`);
                }
                doc.moveDown(0.5);
                doc.strokeColor('#cccccc').moveTo(30, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
            });
        }

        doc.end();
    });
}

async function generateEmptyReport(fecha) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30 });
        let buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        
        doc.on('end', async () => {
            try {
                const pdfData = Buffer.concat(buffers);
                const newReport = dailyReportRepository.create({ 
                    fecha_reporte: fecha,
                    filename: `Reporte_${fecha}.pdf`,
                    pdf_data: pdfData
                });
                await dailyReportRepository.save(newReport);
                resolve(newReport);
            } catch (error) {
                reject(error);
            }
        });

        doc.on('error', reject);

        doc.fontSize(18).text(`Reporte Diario de Movimientos`, { align: 'center' });
        doc.fontSize(12).text(`Fecha: ${fecha}`, { align: 'center' });
        doc.moveDown();
        doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).text("No hubo movimientos en esta fecha.", { align: 'center' });

        doc.end();
    });
}