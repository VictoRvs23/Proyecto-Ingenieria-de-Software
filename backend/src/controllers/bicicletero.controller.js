import { BicicleteroService } from "../services/bicicletero.service.js";
import { spaceValidation, bikeEntryValidation } from "../validations/bicicletero.validation.js";

const service = new BicicleteroService();

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
        const { error, value } = bikeEntryValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }
        
        const added = await service.addBike(req.user.id, value);
        return res.json(added);
    } catch (e) {
        return res.status(400).json({ error: e.message });
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

