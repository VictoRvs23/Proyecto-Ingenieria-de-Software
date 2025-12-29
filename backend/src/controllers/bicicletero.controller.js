import { BicicleteroService } from "../services/bicicletero.service.js";

const service = new BicicleteroService();

export const getAllBicicleteros = async (req, res) => {
  try {
    const data = await service.getAllBicicleteros();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBicicleteroByNumber = async (req, res) => {
  try {
    const { number } = req.params;
    if (!number) {
      return res.status(400).json({ error: "Falta parámetro: number" });
    }
    const data = await service.getBicicleteroByNumber(number);
    return res.json(data);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

export const getStatus = async (req, res) => {
    try {
        const data = await service.getStatus();
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

export const entryBike = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const guardId = Number(req.user.id);

    const { brand, model, color, owner, bicicletero, space } = req.body;
    if (!model || !owner || !color || !brand || !bicicletero) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const spaceNum = space ? Number(space) : undefined;
    const bicicleteroId = Number(bicicletero);

    const bikeData = { brand, model, color, owner, bicicletero, space: spaceNum };

    const result = await service.addBike(guardId, bikeData, bicicleteroId);
    return res.status(201).json({ message: "Bicicleta ingresada", bike: result });
  } catch (error) {
    console.error("[entryBike] error:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const exitBike = async (req, res) => {
    try {
        await service.removeBike(req.user.id, req.params.id);
        return res.json({ message: "Bicicleta retirada" });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
};

export const toggleSpaceStatus = async (req, res) => {
  try {
    const { number, spaceNumber } = req.params;
    const { disable } = req.body;
    
    if (!number || !spaceNumber) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }
    
    const result = await service.toggleSpaceStatus(number, spaceNumber, disable);
    return res.json({ message: "Estado del espacio actualizado", data: result });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
