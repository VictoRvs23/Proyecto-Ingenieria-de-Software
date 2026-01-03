import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url"; 
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import { createUsers } from "./config/initDb.js";
import { setupCronJobs } from './config/cronJobs.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/uploads', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

connectDB()
  .then(() => {
    // Inicializar cron jobs después de conectar a la base de datos
    setupCronJobs();
    routerApi(app);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, async () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);

      try {
        await createUsers();
      } catch (err) {
        console.error("Error al crear usuarios:", err);
      }
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });