import { deleteTurn } from "./turn.service.js";
// Elimina un usuario y su turno asociado (si existe)
export async function deleteUserAndTurn(userId) {
  try {
    // Eliminar turno si existe
    try {
      await deleteTurn(userId);
    } catch (e) {
      // Si no tiene turno, ignorar error
    }
    // Eliminar usuario
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new Error("Usuario no encontrado");
    await userRepository.remove(user);
    return { message: "Usuario y turno eliminados correctamente" };
  } catch (error) {
    throw new Error(`Error al eliminar usuario: ${error.message}`);
  }
}
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const existingUser = await userRepository.findOneBy({ email: data.email });
  
  if (existingUser) {
    throw new Error("Este correo ya está registrado");
  }

  const existingPhone = await userRepository.findOneBy({ numeroTelefonico: data.numeroTelefonico });
  
  if (existingPhone) {
    throw new Error("Este número telefónico ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
    numeroTelefonico: data.numeroTelefonico,
    nombre: data.nombre,
    role: "user",
  });

  return await userRepository.save(newUser);
}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

export async function getAllUsers() {
  try {
    const users = await userRepository.find({
      select: ['id', 'email', 'role', 'nombre', 'numeroTelefonico', 'created_at'],
      order: { id: 'ASC' }
    });
    return users;
  } catch (error) {
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
}
