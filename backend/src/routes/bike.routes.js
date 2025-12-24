import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"; 
import { upload, processImage } from "../middleware/upload.middleware.js"; 
import{
    createBike, 
    getBike, 
    getBikes, 
    updateBike,
    deleteBike
} from "../controllers/bike.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getBikes);       
router.get("/:id", getBike);    

router.post("/", createBike);     

router.patch("/:id", upload.single("image"), processImage, updateBike);  

router.delete("/:id", deleteBike); 

export default router;