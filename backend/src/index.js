import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import http from "http"; 
import { Server as SocketServer } from "socket.io"; 
import { fileURLToPath } from "url"; 
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import { Mensaje } from "./entities/mensaje.entity.js";
import { User } from "./entities/user.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

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

io.on('connection', (socket) => {
  console.log('Cliente conectado al chat:', socket.id);

  socket.on('pedir_historial', async () => {
    try {
      const mensajeRepo = AppDataSource.getRepository(Mensaje);
      const historial = await mensajeRepo.find({
        relations: { usuario: true }, 
        order: { created_at: 'ASC' },
        take: 50
      });
      socket.emit('historial_mensajes', historial);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  });

  socket.on('enviar_mensaje', async (data) => {
    try {
      const { userId, contenido, rol } = data;
      const mensajeRepo = AppDataSource.getRepository(Mensaje);
      const userRepo = AppDataSource.getRepository(User);

      const usuario = await userRepo.findOneBy({ id: userId });

      if (usuario) {
        const nuevoMensaje = mensajeRepo.create({
          contenido,
          rol_sender: rol,
          usuario: usuario
        });

        const guardado = await mensajeRepo.save(nuevoMensaje);

        // CAMBIO AQUÍ: Usamos socket.broadcast.emit
        // Esto envía el mensaje a TODOS excepto al remitente (tú)
        socket.broadcast.emit('nuevo_mensaje', {
          id: guardado.id,
          contenido: guardado.contenido,
          rol_sender: guardado.rol_sender,
          created_at: guardado.created_at,
          usuario: { nombre: usuario.nombre }
        });
      }
    } catch (error) {
      console.error("Error guardando mensaje:", error);
    }
  });
});

connectDB()
  .then(() => {
    routerApi(app);
    const PORT = process.env.PORT || 3000;
  
    server.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });