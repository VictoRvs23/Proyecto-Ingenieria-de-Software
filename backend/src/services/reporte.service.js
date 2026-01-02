import { AppDataSource } from "../config/configDb.js";
import { Reporte } from "../entities/Reporte.entity.js"; 

export const createReportService = async (data, userId) => {
  const reporteRepository = AppDataSource.getRepository(Reporte);
  const nuevoReporte = reporteRepository.create({
    ...data,
    user: { id: userId }, 
  });
  return await reporteRepository.save(nuevoReporte);
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
  const reporte = await reporteRepository.findOneBy({ id: Number(id) });

  if (!reporte) return null;

  reporte.estado = estado;

  if (respuesta) {
      reporte.respuesta = respuesta;
  }

  return await reporteRepository.save(reporte);
};