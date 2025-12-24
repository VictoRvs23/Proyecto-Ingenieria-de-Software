import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import fs from "fs";
import path from "path";

export function getInform(req, res) {
  try {
    const { id } = req.params;
    const filePath = path.resolve(`./uploads/${id}`);

    if (!fs.existsSync(filePath)) {
      return handleErrorClient(res, "Informe no encontrado", 404);
    }

    const data = fs.readFileSync(filePath, "utf8");
    handleSuccess(res, { id, content: data }, "Informe obtenido correctamente");
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export function getInforms(req, res) {
  try {
    const folderPath = path.resolve("./uploads");
    if (!fs.existsSync(folderPath)) {
      return handleErrorClient(res, "No existen informes", 404);
    }

    const files = fs.readdirSync(folderPath);
    handleSuccess(res, files, "Lista de informes obtenida correctamente");
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function downloadInform(req, res) {
  try {
    const { id } = req.params;
    const filePath = path.resolve(`./uploads/${id}`);

    if (!fs.existsSync(filePath)) {
      return handleErrorClient(res, "Archivo no encontrado", 404);
    }

    res.download(filePath, id, (err) => {
      if (err) handleErrorServer(res, err);
    });
  } catch (error) {
    handleErrorServer(res, error);
  }
}

export async function deleteInform(req, res) {
  try {
    const { id } = req.params;
    const filePath = path.resolve(`./uploads/${id}`);

    if (!fs.existsSync(filePath)) {
      return handleErrorClient(res, "Informe no encontrado", 404);
    }

    fs.unlinkSync(filePath);
    handleSuccess(res, { id }, "Informe eliminado correctamente");
  } catch (error) {
    handleErrorServer(res, error);
  }
}
