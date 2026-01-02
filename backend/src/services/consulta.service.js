import { AppDataSource } from "../config/configDb.js";
import { Consulta } from "../entities/consulta.entity.js";

export const createConsultaService = async (data, userId) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  const nuevaConsulta = consultaRepository.create({
    ...data,
    user: { id: userId },
  });
  return await consultaRepository.save(nuevaConsulta);
};

export const getAllConsultasService = async () => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  return await consultaRepository.find({
    relations: ["user"],
    order: { created_at: "DESC" },
  });
};

export const getConsultasByUserService = async (userId) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  return await consultaRepository.find({
    where: { user: { id: userId } },
    relations: ["user"],
    order: { created_at: "DESC" },
  });
};

export const updateConsultaStatusService = async (id, estado, respuesta) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  const consulta = await consultaRepository.findOneBy({ id: Number(id) });

  if (!consulta) return null;

  consulta.estado = estado;

  if (respuesta) {
    consulta.respuesta = respuesta;
  }

  return await consultaRepository.save(consulta);
};

export const deleteConsultaService = async (id) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  const consulta = await consultaRepository.findOneBy({ id: Number(id) });

  if (!consulta) return null;

  return await consultaRepository.remove(consulta);
};
