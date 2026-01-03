import { 
  createReportService, 
  getAllReportsService, 
  getReportsByUserService, 
  updateReportStatusService,
  deleteReportService 
} from "../services/reporte.service.js";

export const createReport = async (req, res) => {
  try {
    const { titulo, descripcion, tipo } = req.body;
    const userId = req.user.id;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const reporte = await createReportService(
      { titulo, descripcion, tipo, imagenUrl },
      userId
    );

    res.status(201).json({ message: "Reporte creado exitosamente", data: reporte });
  } catch (error) {
    console.error("Error al crear reporte:", error);
    res.status(500).json({ message: "Error interno al crear el reporte" });
  }
};

export const getReports = async (req, res) => {
  try {
    const reportes = await getAllReportsService();
    res.status(200).json(reportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reportes" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reportes = await getReportsByUserService(userId);
    res.status(200).json(reportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus reportes" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    const reporteActualizado = await updateReportStatusService(id, estado, respuesta);

    if (!reporteActualizado) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    res.status(200).json({ message: "Estado actualizado", data: reporteActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await deleteReportService(id);

        if (!resultado) {
            return res.status(404).json({ message: "Reporte no encontrado" });
        }

        return res.status(200).json({ message: "Reporte eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        return res.status(500).json({ message: "Error al eliminar el reporte" });
    }
};