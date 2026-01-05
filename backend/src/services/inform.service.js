import { AppDataSource } from "../config/configDb.js";
import { Inform } from "../entities/inform.entity.js";
import { DailyReport } from "../entities/dailyReport.entity.js";
import { Turn } from "../entities/turn.entity.js";
import PDFDocument from "pdfkit";

const informRepository = AppDataSource.getRepository(Inform);
const dailyReportRepository = AppDataSource.getRepository(DailyReport);
const turnRepository = AppDataSource.getRepository(Turn);

export async function createInformLog(reserve, note = "", actionType = null) {
    try {
        const tipoAccion = actionType || reserve.estado;
        
        const newLog = informRepository.create({
            bicicletero_number: reserve.bicicletero ? reserve.bicicletero.number : null,
            estado_nuevo: tipoAccion,
            user: reserve.user,
            user_email_snapshot: reserve.user.email,
            bike: reserve.bike,
            nota: note || "Sin nota",
            espacio: reserve.space || null
        });

        await informRepository.save(newLog);
        console.log(`Log de informe creado con éxito. Tipo: ${tipoAccion}`);
    } catch (error) {
        console.error("Error creando log de informe:", error);
    }
}


export async function createInformLogForTurn(turn, note = "", actionType = "turno_cambiado") {
    try {
        const turnWithUser = await turnRepository.findOne({
            where: { id: turn.id },
            relations: ["user"]
        });

        if (!turnWithUser || !turnWithUser.user) {
            console.error("No se pudo obtener información del usuario para el log de turno");
            return;
        }

        const newLog = informRepository.create({
            bicicletero_number: turn.bicicletero ? parseInt(turn.bicicletero) : null,
            estado_nuevo: actionType,
            user: turnWithUser.user,
            user_email_snapshot: turnWithUser.user.email,
            bike: null, 
            nota: `${note}. Guardia: ${turnWithUser.user.nombre || turnWithUser.user.name || 'N/A'}, ` +
                `Email: ${turnWithUser.user.email}, ` +
                `Bicicletero: ${turn.bicicletero || 'N/A'}, ` +
                `Horario: ${turn.hora_inicio || 'N/A'} - ${turn.hora_salida || 'N/A'}`,
            espacio: null
        });

        await informRepository.save(newLog);
        console.log("Log de turno creado con éxito.");
    } catch (error) {
        console.error("Error creando log de turno:", error);
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
                const biciId = log.bike ? log.bike.id : "N/A";
                const userId = log.user ? log.user.id : "N/A";
                const userName = log.user ? (log.user.nombre || log.user.name || "N/A") : "N/A";
                const userEmail = log.user_email_snapshot || "Sin email";
                const bicicletero = log.bicicletero_number || "N/A";
                const nota = log.nota ? log.nota : "Sin nota";
                const estado = log.estado_nuevo.toUpperCase();
                const espacio = log.espacio ? `Espacio: ${log.espacio}` : "";
                let color = 'black';
                let tituloAccion = estado;
                
                switch(log.estado_nuevo.toLowerCase()) {
                    case 'solicitada':
                        color = 'orange';
                        tituloAccion = 'RESERVA CREADA';
                        break;
                    case 'ingresada':
                        color = 'green';
                        tituloAccion = 'BICICLETA INGRESADA';
                        break;
                    case 'entregada':
                        color = 'blue';
                        tituloAccion = 'BICICLETA ENTREGADA';
                        break;
                    case 'cancelada':
                        color = 'red';
                        tituloAccion = 'RESERVA CANCELADA';
                        break;
                    case 'turno_cambiado':
                        color = 'purple';
                        tituloAccion = 'TURNO MODIFICADO';
                        break;
                    default:
                        color = 'black';
                        tituloAccion = estado;
                }

                doc.fontSize(10).font('Helvetica-Bold');
                doc.fillColor(color);
                doc.text(`[${hora}] ${tituloAccion}`);
                doc.fillColor('black').font('Helvetica');
                
                if (log.estado_nuevo.toLowerCase() === 'turno_cambiado') {
                    doc.text(`Guardia: ${userName} (ID: ${userId})`);
                    doc.text(`Email: ${userEmail}`);
                    doc.text(`Bicicletero asignado: ${bicicletero}`);
                    const horarioMatch = nota.match(/Horario:\s*([^-]+)\s*-\s*(.+)/);
                    if (horarioMatch) {
                        doc.text(`Horario: ${horarioMatch[1].trim()} - ${horarioMatch[2].trim()}`);
                    }
                } else {
                    doc.text(`Bicicletero: #${bicicletero}  |  Bici ID: ${biciId}  |  Usuario ID: ${userId}`);
                    doc.text(`Usuario: ${userName} (${userEmail})`);
                    if (espacio) {
                        doc.text(espacio);
                    }
                }
                
                if (nota !== "Sin nota" && nota !== "") {
                    doc.font('Helvetica-Oblique').fillColor('gray');
                    if (log.estado_nuevo.toLowerCase() !== 'turno_cambiado') {
                        doc.text(`Nota: "${nota}"`);
                    }
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