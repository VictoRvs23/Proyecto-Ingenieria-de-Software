import { handleErrorServer } from "../Handlers/responseHandlers.js";
import { generateInformPdf } from "../services/inform.service.js";

export async function downloadInform(req, res) {
    try {
        await generateInformPdf(res);
    } catch (error) {
        handleErrorServer(res, 500, "Error generando PDF", error.message);
    }
}
