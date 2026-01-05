import {
  createConsultaService,
  getAllConsultasService,
  getConsultasByUserService,
  updateConsultaStatusService,
  deleteConsultaService,
} from "../services/consulta.service.js";

export const createConsulta = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Solo usuarios pueden crear consultas",
      });
    }

    const { pregunta } = req.body;
    const userId = req.user.id;

    if (!pregunta || pregunta.trim() === "") {
      return res.status(400).json({ message: "La pregunta es requerida" });
    }

    const consulta = await createConsultaService({ pregunta }, userId);

    res
      .status(201)
      .json({ message: "Consulta creada exitosamente", data: consulta });
  } catch (error) {
    console.error("Error al crear consulta:", error);
    res.status(500).json({ message: "Error interno al crear la consulta" });
  }
};

export const getConsultas = async (req, res) => {
  try {
    if (
      req.user.role !== "admin" &&
      req.user.role !== "adminBicicletero" &&
      req.user.role !== "guard"
    ) {
      return res.status(403).json({
        message: "No autorizado para ver todas las consultas",
      });
    }

    const consultas = await getAllConsultasService();
    res.status(200).json(consultas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener consultas" });
  }
};

export const getMyConsultas = async (req, res) => {
  try {
    const userId = req.user.id;
    const consultas = await getConsultasByUserService(userId);
    res.status(200).json(consultas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus consultas" });
  }
};

export const updateConsultaResponse = async (req, res) => {
  try {
    if (
      req.user.role !== "admin" &&
      req.user.role !== "adminBicicletero" &&
      req.user.role !== "guard"
    ) {
      return res.status(403).json({
        message: "No autorizado para responder consultas",
      });
    }

    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!estado || !respuesta) {
      return res
        .status(400)
        .json({ message: "Estado y respuesta son requeridos" });
    }

    const consultaActualizada = await updateConsultaStatusService(
      id,
      estado,
      respuesta
    );

    if (!consultaActualizada) {
      return res.status(404).json({ message: "Consulta no encontrada" });
    }

    res
      .status(200)
      .json({ message: "Respuesta agregada", data: consultaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar consulta" });
  }
};

export const deleteConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const consultas = await getConsultasByUserService(userId);
    const consulta = consultas.find((c) => c.id === Number(id));

    if (!consulta) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta consulta" });
    }

    await deleteConsultaService(id);

    res.status(200).json({ message: "Consulta eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar consulta" });
  }
};
