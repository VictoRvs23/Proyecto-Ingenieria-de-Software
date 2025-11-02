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
