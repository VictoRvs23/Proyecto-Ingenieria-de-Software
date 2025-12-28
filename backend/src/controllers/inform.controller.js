import { handleErrorServer, handleSuccess, handleErrorClient } from "../Handlers/responseHandlers.js";
import { generateDailyReport, listReports, getReportById } from "../services/inform.service.js";

// 1. GET /api/informs/history -> Devuelve lista con URLs
export async function getHistoryUrls(req, res) {
    try {
        const reports = await listReports();

        // CONSTRUIMOS LA URL DINÁMICA
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}/api/informs/download`;

        const data = reports.map(report => ({
            fecha: report.fecha_reporte,
            archivo: report.filename,
            // AQUÍ ESTÁ LA URL QUE PEDISTE:
            url_descarga: `${baseUrl}/${report.id}` 
        }));

        handleSuccess(res, 200, "Historial disponible", data);
    } catch (error) {
        handleErrorServer(res, 500, "Error listando reportes", error.message);
    }
}

// 2. GET /api/informs/download/:id -> Descarga real
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

// 3. GET /api/informs/today -> Genera el de hoy y devuelve SU url
export async function generateToday(req, res) {
    try {
        const report = await generateDailyReport();
        
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/api/informs/download/${report.id}`;

        handleSuccess(res, 200, "Reporte del día generado", { url: url });
    } catch (error) {
        handleErrorServer(res, 500, "Error generando reporte", error.message);
    }
}