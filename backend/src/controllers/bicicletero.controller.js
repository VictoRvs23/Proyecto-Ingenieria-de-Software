import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import bcrypt from "bcrypt";

export function getAvaibableSpace(req, res) {
    handleSuccess(res, 200, "Espacio disponible obtenido exitosamente", {
        message: "Espacio disponible obtenido exitosamente",
    });
}

export async function entryBike(req, res) {
  try {
    const { bikeId, ownerName } = req.body;

    if (!bikeId || !ownerName)
      return handleErrorClient(res, "Datos insuficientes", 400);

    const entryId = bcrypt.hashSync(Date.now().toString(), 5).replace(/\//g, "");
    const query = "INSERT INTO bikes (entry_id, bike_id, owner_name) VALUES ($1, $2, $3) RETURNING *";
    const values = [entryId, bikeId, ownerName];

    const result = await pool.query(query, values);
    handleSuccess(res, 201, "Entrada registrada correctamente", result.rows[0]);
  } catch (error) {
    handleErrorServer(res, error);
  }
}


export async function outingBike(req, res) {
     try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM bikes WHERE entry_id = $1 RETURNING *", [id]);
    if (result.rowCount === 0)
      return handleErrorClient(res, "Bicicleta no encontrada", 404);

    handleSuccess(res, 200, "Bicicleta eliminada exitosamente", result.rows[0]);
  } catch (error) {
    handleErrorServer(res, error);
  }
}
