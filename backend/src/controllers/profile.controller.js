import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHandlers.js";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

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
    handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
      message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
      userData: {
        email: user.email,
        password: user.password
      }
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener perfil privado", error.message);
  }
}

export async function updatePrivateProfile(req, res) {
  try {
    const userFromToken = req.user;
    const { email, password } = req.body;

    if (!email && !password) {
      return handleErrorClient(res, 400, "Debes proporcionar email y/o password para actualizar.");
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userFromToken.sub });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

  
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepository.save(user);
    delete user.password;
    handleSuccess(res, 200, "Perfil privado actualizado exitosamente", {
      message: `¡Hola, ${user.email}! Tu perfil ha sido actualizado.`,
      userData: user,
    });
  } catch (error) {
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
    if (req.user.role !== "admin") return res.status(403).json({ error: "No autorizado" });

    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role es requerido en el body" });

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
