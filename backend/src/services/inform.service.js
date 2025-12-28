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


export async function generateInformPdf(res) {
    // 1. Buscar datos
    const logs = await informRepository.find({
        relations: ["user", "bike"],
        order: { fecha_hora: "DESC" }
    });

    // 2. Crear documento
    const doc = new PDFDocument({ margin: 30, layout: 'landscape' });

    // 3. Headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=informe_movimientos.pdf');

    // 4. Conectar el PDF a la respuesta (Pipe)
    doc.pipe(res);

    // ... (Toda tu lógica de dibujo: Títulos, Cabeceras, etc.) ...
    doc.fontSize(20).text("Informe Histórico de Movimientos", { align: "center" });

    // ... (Tu loop forEach de logs) ...
    logs.forEach((log) => {
       // ... tu lógica de pintar filas ...
       doc.text(log.estado_nuevo); // Ejemplo
    });

    // 5. ¡¡MUY IMPORTANTE!! FINALIZAR EL DOCUMENTO
    doc.end(); 
}