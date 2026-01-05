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


export const checkAvailability = async (req, res) => {
  try {
    const { number } = req.params;
    if (!number) {
      return res.status(400).json({ error: "Falta parámetro: number" });
    }
    const service = new BicicleteroService();
    const data = await service.checkAvailability(number); 
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
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
