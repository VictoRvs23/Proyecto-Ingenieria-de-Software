import { Router } from "express";
import { getAvaibableSpace, entryBike,outingBike} from "../controllers/bibicletero.controller.js";

const router = Router();

router.get("/", getAvaibableSpace);

router.post("/bicicletero", entryBike);
router.delete("/bibicletero:id", outingBike);


export default router;