import { AppDataSource } from "../config/configDb.js";
import { Notificacion } from "../entities/notificacion.entity.js";
import { User } from "../entities/user.entity.js";
import { In } from "typeorm";

export const crearNotificacionService = async ({ userId, mensaje, tipo, referenciaId }) => {
  try {
    const notificacionRepo = AppDataSource.getRepository(Notificacion);
    const nuevaNotificacion = notificacionRepo.create({
      user: { id: userId },
      mensaje,
      tipo,
      referenciaId
    });
    return await notificacionRepo.save(nuevaNotificacion);
  } catch (error) {
    console.error("Error al crear notificación:", error);
  }
};

export const crearNotificacionPorRol = async ({ roles, mensaje, tipo, referenciaId }) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const notificacionRepo = AppDataSource.getRepository(Notificacion);
    const usuariosDestino = await userRepo.find({
      where: { role: In(roles) }
    });

    if (usuariosDestino.length === 0) return;

    const notificaciones = usuariosDestino.map(usuario => {
      return notificacionRepo.create({
        user: { id: usuario.id },
        mensaje: mensaje,
        tipo: tipo,
        referenciaId: referenciaId
      });
    });

    await notificacionRepo.save(notificaciones);
    console.log(`Notificaciones enviadas a ${usuariosDestino.length} usuarios con roles: ${roles.join(', ')}`);

  } catch (error) {
    console.error("Error al enviar notificaciones masivas:", error);
  }
};

export const obtenerNotificacionesService = async (userId) => {
  const notificacionRepo = AppDataSource.getRepository(Notificacion);
  return await notificacionRepo.find({
    where: { user: { id: userId } },
    order: { created_at: "DESC" },
    take: 20
  });
};

export const marcarLeidaService = async (notificacionId) => {
  const notificacionRepo = AppDataSource.getRepository(Notificacion);
  const notificacion = await notificacionRepo.findOneBy({ id: notificacionId });
  if (notificacion) {
    notificacion.leido = true;
    await notificacionRepo.save(notificacion);
  }
  return notificacion;
};