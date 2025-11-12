import { Router } from "express";
import {createBike, getBike, getBikes, uploadBike, deleteBike} from "../controllers/bike.controller.js";

const router = Router();

router.get("/", getBikes);      
router.get("/:id", getBike);     

router.post("/", createBike);     
router.put("/:id", uploadBike);  
router.delete("/:id", deleteBike); 


export default router;