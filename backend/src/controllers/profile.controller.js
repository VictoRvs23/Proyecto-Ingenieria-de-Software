import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { getAllUsers } from "../services/user.service.js";

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "¡Hola! Este es un perfil público. Cualquiera puede verlo.",
  });
}

export async function getPrivateProfile(req, res) {
  const userFromToken = req.user;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email: userFromToken.email });
    
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }
    
    const { password, ...userData } = user;

    handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
      message: `¡Hola, ${user.email}!`,
      userData: userData
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener perfil privado", error.message);
  }
}

export async function updatePrivateProfile(req, res) {
  try {
    console.log('========== UPDATE PROFILE START ==========');
    console.log('🔐 Usuario del token:', req.user);
    console.log('📦 Body recibido:', req.body);
    console.log('📷 Archivo recibido:', req.file);
    
    const userFromToken = req.user;
    const { email, password, nombre, numeroTelefonico } = req.body;
    const imageFile = req.file; 

    if (!email && !password && !nombre && !numeroTelefonico && !imageFile) {
      console.log('❌ No hay datos para actualizar');
      return handleErrorClient(res, 400, "Debes proporcionar datos para actualizar.");
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userFromToken.id }); 

    if (!user) {
      console.log('❌ Usuario no encontrado en BD');
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }
    
    console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, role: user.role });

    if (email) user.email = email;
    if (nombre) user.nombre = nombre;
    if (numeroTelefonico) user.numeroTelefonico = numeroTelefonico;
    
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    if (imageFile) {
        console.log('📷 Guardando imagen:', imageFile.filename);
        user.userImage = `/uploads/${imageFile.filename}`;
    }

    await userRepository.save(user);
    console.log('✅ Usuario guardado en BD');
    
    const { password: _, ...userWithoutPass } = user;

    console.log('✅ Respuesta a enviar:', userWithoutPass);
    console.log('========== UPDATE PROFILE END ==========');
    
    handleSuccess(res, 200, "Perfil actualizado exitosamente", {
      message: `¡Datos actualizados!`,
      userData: userWithoutPass,
    });

  } catch (error) {
    console.error('❌❌ ERROR EN updatePrivateProfile:', error);
    handleErrorServer(res, 500, "Error al actualizar perfil", error.message);
  }
}

export async function deletePrivateProfile(req, res) {
  try {
    const userFromToken = req.user;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userFromToken.sub });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }
    await userRepository.remove(user);
    handleSuccess(res, 200, "Perfil privado eliminado exitosamente", {
      message: `¡Hola, ${user.email}! Tu perfil ha sido eliminado.`,
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar perfil", error.message);
  }
}

export async function updateUserRole(req, res) {
  try {
    const paramId = req.params?.id;
    const targetId = Number(paramId);
    if (!paramId || Number.isNaN(targetId)) {
      return res.status(400).json({ error: "Id inválido en la ruta" });
    }

    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role !== "admin" && req.user.role !== "adminBicicletero") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role es requerido en el body" });

    const validRoles = ['user', 'guard', 'adminBicicletero', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id: targetId });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.role = role;
    await repo.save(user);
    return res.json({ message: "Rol actualizado", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getUsers(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role !== "admin" && req.user.role !== "adminBicicletero") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const users = await getAllUsers();
    handleSuccess(res, 200, "Usuarios obtenidos exitosamente", users);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener usuarios", error.message);
  }
}