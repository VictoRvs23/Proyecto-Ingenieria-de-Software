import { AppDataSource } from "../config/configDb.js";
import { Reporte } from "../entities/Reporte.entity.js"; 
import { crearNotificacionService, crearNotificacionPorRol } from "./notificacion.service.js";

export const createReportService = async (data, userId) => {
  const reporteRepository = AppDataSource.getRepository(Reporte);
  const nuevoReporte = reporteRepository.create({
    ...data,
    user: { id: userId }, 
  });
  
  const reporteGuardado = await reporteRepository.save(nuevoReporte);

  await crearNotificacionPorRol({
    roles: ['admin', 'adminBicicletero'],
    mensaje: `📢 Nuevo reporte creado: "${data.titulo}"`,
    tipo: 'REPORTE',
    referenciaId: reporteGuardado.id
  });

  return reporteGuardado;
};

export const getAllReportsService = async () => {
  const reporteRepository = AppDataSource.getRepository(Reporte);
  return await reporteRepository.find({
    relations: ["user"], 
  });
};

export const getReportsByUserService = async (userId) => {
  const reporteRepository = AppDataSource.getRepository(Reporte);
  return await reporteRepository.find({
    where: { user: { id: userId } },
    relations: ["user"],
  });
};

export const updateReportStatusService = async (id, estado, respuesta) => {
  const reporteRepository = AppDataSource.getRepository(Reporte);
  const reporte = await reporteRepository.findOne({
    where: { id: Number(id) },
    relations: ["user"]
  });

  if (!reporte) return null;

  reporte.estado = estado;

  if (respuesta) {
      reporte.respuesta = respuesta;
  }

  const reporteActualizado = await reporteRepository.save(reporte);

  if (reporte.user) {
    let mensaje = `Tu reporte #${reporte.id} ha cambiado a estado: ${estado}.`;
    if (respuesta) mensaje += " Se ha añadido una respuesta.";

    await crearNotificacionService({
      userId: reporte.user.id,
      mensaje: mensaje,
      tipo: 'REPORTE',
      referenciaId: reporte.id
    });
  }

  return reporteActualizado;
};

export async function deleteReportService(id) {
    try {
        const reportRepository = AppDataSource.getRepository(Reporte);
        const report = await reportRepository.findOne({ where: { id: Number(id) } });

        if (!report) {
            return null;
        }

        const deletedReport = await reportRepository.remove(report);
        return deletedReport;
    } catch (error) {
        console.error("Error en deleteReportService:", error);
        throw error;
    }
}