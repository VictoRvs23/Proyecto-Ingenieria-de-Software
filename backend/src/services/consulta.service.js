import { AppDataSource } from "../config/configDb.js";
import { Consulta } from "../entities/consulta.entity.js";
import { crearNotificacionService, crearNotificacionPorRol } from "./notificacion.service.js";

export const createConsultaService = async (data, userId) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  const nuevaConsulta = consultaRepository.create({
    ...data,
    user: { id: userId },
  });
  
  const consultaGuardada = await consultaRepository.save(nuevaConsulta);

  await crearNotificacionPorRol({
    roles: ['admin', 'adminBicicletero', 'guard'],
    mensaje: `Nueva consulta recibida: "${data.asunto || 'Sin asunto'}"`,
    tipo: 'CONSULTA',
    referenciaId: consultaGuardada.id
  });

  return consultaGuardada;
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
  const consulta = await consultaRepository.findOne({
    where: { id: Number(id) },
    relations: ["user"]
  });

  if (!consulta) return null;

  consulta.estado = estado;

  if (respuesta) {
    consulta.respuesta = respuesta;
  }

  const consultaActualizada = await consultaRepository.save(consulta);

  if (consulta.user) {
    let mensaje = `Tu consulta sobre "${consulta.asunto}" ha cambiado a estado: ${estado}.`;
    if (respuesta) mensaje += " Te han respondido.";

    await crearNotificacionService({
      userId: consulta.user.id,
      mensaje: mensaje,
      tipo: 'CONSULTA',
      referenciaId: consulta.id
    });
  }

  return consultaActualizada;
};

export const deleteConsultaService = async (id) => {
  const consultaRepository = AppDataSource.getRepository(Consulta);
  const consulta = await consultaRepository.findOneBy({ id: Number(id) });

  if (!consulta) return null;

  return await consultaRepository.remove(consulta);
};