'use strict';
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { deleteTurn } from "./turn.service.js";
import { sendEmail } from "./email.service.js"; // <--- 1. IMPORTA TU NUEVO SERVICIO
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

/**
 * Elimina usuario y su turno asociado
 */
export async function deleteUserAndTurn(userId) {
  try {
    try {
      await deleteTurn(userId);
    } catch (e) {
      // Si no hay turno, ignoramos el error y seguimos
    }
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) throw new Error("Usuario no encontrado");
    await userRepository.remove(user);
    return { message: "Usuario y turno eliminados correctamente" };
  } catch (error) {
    throw new Error(`Error al eliminar usuario: ${error.message}`);
  }
}

/**
 * Crea un nuevo usuario y envía correo de bienvenida
 */
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

  // 2. GUARDAMOS EL USUARIO EN LA BD
  const savedUser = await userRepository.save(newUser);

  // 3. ENVIAMOS EL GMAIL (No usamos await aquí para que la respuesta al usuario sea instantánea)
  sendEmail(
    savedUser.email,
    "¡Bienvenido al Sistema Bicicletero UBB!",
    `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2c3e50;">¡Hola ${savedUser.nombre}!</h2>
      <p>Gracias por registrarte en nuestro sistema de bicicleteros.</p>
      <p>Ahora puedes acceder a la plataforma para:</p>
      <ul>
        <li>Reservar espacios para tu bicicleta.</li>
        <li>Ver el estado de los bicicleteros en tiempo real.</li>
        <li>Realizar consultas y reportes.</li>
      </ul>
      <p style="margin-top: 20px;">Saludos,<br><b>Equipo Bicicletero UBB</b></p>
    </div>
    `
  ).catch(err => console.error("Error enviado correo de bienvenida:", err));

  return savedUser;
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