import { obtenerNotificacionesService, marcarLeidaService } from "../services/notificacion.service.js";

export const getNotificaciones = async (req, res) => {
  try {
    const userId = req.user.id; 
    const notificaciones = await obtenerNotificacionesService(userId);
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await marcarLeidaService(id);
    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ message: "Error al marcar como leída" });
  }
};