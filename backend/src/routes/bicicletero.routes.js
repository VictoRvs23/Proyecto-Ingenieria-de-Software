import { Router } from "express";
import { getAvaibableSpace, entryBike,outingBike} from "../controllers/bibicletero.controller.js";

const router = Router();

router.get("/", getAvaibableSpace);

router.post("/entry", Guard, entryBike);
router.delete("/outing",Guard, outingBike);


export default router;