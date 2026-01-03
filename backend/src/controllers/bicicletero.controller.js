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

// Nuevo endpoint para verificar disponibilidad
export const checkAvailability = async (req, res) => {
  try {
    const { number } = req.params;
    if (!number) {
      return res.status(400).json({ error: "Falta parámetro: number" });
    }
    const service = new BicicleteroService(); // Crear instancia del servicio
    const data = await service.checkAvailability(number); // Llamar al método
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Los endpoints entryBike y exitBike ahora están obsoletos
// Se mantienen por compatibilidad pero lanzan error

export const entryBike = async (req, res) => {
  try {
    return res.status(410).json({ 
      error: "Este endpoint está obsoleto. Use el sistema de reservas en su lugar.",
      message: "Para ingresar una bicicleta, cree una reserva y luego actualice su estado a 'ingresada'"
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const exitBike = async (req, res) => {
    try {
        return res.status(410).json({ 
          error: "Este endpoint está obsoleto. Use el sistema de reservas en su lugar.",
          message: "Para retirar una bicicleta, actualice el estado de la reserva a 'entregada'"
        });
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