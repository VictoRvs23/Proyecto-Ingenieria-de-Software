import { handleErrorServer, handleSuccess, handleErrorClient } from "../Handlers/responseHandlers.js";
import { generateDailyReport, listReports, getReportById } from "../services/inform.service.js";


function isAfter8PM() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 20; 
}

export async function getHistoryUrls(req, res) {
    try {
        const reports = await listReports();

        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}/api/informs/download`;

        const data = reports.map(report => ({
            fecha: report.fecha_reporte,
            archivo: report.filename,
            url_descarga: `${baseUrl}/${report.id}` 
        }));

        handleSuccess(res, 200, "Historial disponible", data);
    } catch (error) {
        handleErrorServer(res, 500, "Error listando reportes", error.message);
    }
}

export async function downloadReportById(req, res) {
    try {
        const { id } = req.params;
        const report = await getReportById(id);

        if (!report) return handleErrorClient(res, 404, "Reporte no encontrado");

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${report.filename}`);
        res.send(report.pdf_data);

    } catch (error) {
        handleErrorServer(res, 500, "Error descargando", error.message);
    }
}

export async function generateToday(req, res) {
    try {
        
        const report = await generateDailyReport();
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/api/informs/download/${report.id}`;

        handleSuccess(res, 200, "Reporte del día generado", { 
            url: url,
            fecha: report.fecha_reporte,
            mensaje: report.fecha_reporte === new Date().toISOString().split('T')[0] 
                ? "Reporte de hoy generado/actualizado" 
                : "Reporte del día anterior generado"
        });
    } catch (error) {
        handleErrorServer(res, 500, "Error generando reporte", error.message);
    }
}