import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import bcrypt from "bcrypt";

export async function getReserve(req, res) {
    try {
        const { token } = req.params;

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }
        const reserveRepository = req.app.get("db").getRepository("Reserve");
        const reserve = await reserveRepository.findOne({
            where: { token: parseInt(token) },
            relations: ["user"],
        });
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        return handleSuccess(res, 200, reserve);
        } catch (error) {
            handleErrorServer(res, 500, error.message);
        }
    }

export async function getReserves(req, res) {
    try {
        const reserveRepository = req.app.get("db").getRepository("Reserve");
        const reserves = await reserveRepository.find({ relations: ["user"] });
        return handleSuccess(res, 200, reserves);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function createReserve(req, res) {
  try {
    const { user_id } = req.body;
    const userFromToken = req.user;

//multer

    const files = req.files || {};
    if (files.foto && files.foto[0]) {
        body.foto_url = `${req.protocol}://${req.get('host')}/uploads/${files.foto[0].filename}`;
    }
    if (files.doc && files.doc[0]) {
        body.doc_url = `${req.protocol}://${req.get('host')}/uploads/${files.doc[0].filename}`;
    }


    if (user_id !== userFromToken.sub) {
      return handleErrorClient(res, 403, "No tienes permiso para crear una reserva para otro usuario");
    }

    const reserveRepository = req.app.get("db").getRepository("Reserve");

    const token = Math.floor(1000 + Math.random() * 9000);

    const newReserve = reserveRepository.create({
      estado: "ingresada",
      token,
      user: { id: user_id },
    });

    const savedReserve = await reserveRepository.save(newReserve);
    return handleSuccess(res, 201, "Reserva creada exitosamente", savedReserve);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateReserve(req, res) {
    try {
        const { token } = req.params;
        const { estado } = req.body;

        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }
        const reserveRepository = req.app.get("db").getRepository("Reserve");
        const reserve = await reserveRepository.findOneBy({ token: parseInt(token) });
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        if (estado) reserve.estado = estado;

        const updatedReserve = await reserveRepository.save(reserve);
        return handleSuccess(res, 200, "Reserva actualizada exitosamente", updatedReserve);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function deleteReserve(req, res) {
    try {
        const { token } = req.params;
        if (!token || isNaN(token)) {
            return handleErrorClient(res, 400, "Token de reserva inválido");
        }
        const reserveRepository = req.app.get("db").getRepository("Reserve");
        const reserve = await reserveRepository.findOneBy({ token: parseInt(token) });  
        if (!reserve) {
            return handleErrorClient(res, 404, "Reserva no encontrada");
        }
        await reserveRepository.remove(reserve);
        return handleSuccess(res, 200, "Reserva eliminada exitosamente");
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}