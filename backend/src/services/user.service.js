'use strict';
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { deleteTurn } from "./turn.service.js";
import { sendEmail } from "./email.service.js";
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
  // Validaciones de existencia
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

  const savedUser = await userRepository.save(newUser);

  // --- DISEÑO DE CORREO DE BIENVENIDA ---
  const welcomeHTML = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden;">
        <tr>
          <td style="background-color: #1565C0; padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">¡Bienvenido/a al Sistema Bicicletero UBB!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px; color: #444; line-height: 1.6;">
            <h2 style="color: #1565C0; margin-top: 0;">Hola, ${savedUser.nombre}</h2>
            <p>Tu registro ha sido completado con éxito. Ahora puedes acceder a nuestra plataforma para gestionar tus bicicletas y reservas de forma segura.</p>
            
            <p>Ahora puedes acceder a la plataforma para:</p>
            <ul>
              <li>Reservar espacios para tu bicicleta.</li>
              <li>Ver el estado de los bicicleteros en tiempo real.</li>
              <li>Realizar consultas y reportes.</li>
            </ul>
            
            <p style="font-size: 14px; color: #777; margin-top: 20px;">Si tienes dudas, puedes contactar al administrador del sistema.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © 2024 Universidad del Bío-Bío - Concepción, Chile
          </td>
        </tr>
      </table>
    </div>
  `;

  // Enviar email de bienvenida (sin await para respuesta inmediata)
  sendEmail(savedUser.email, "¡Bienvenido al Sistema Bicicletero UBB!", welcomeHTML)
    .catch(err => console.error("Error enviado correo de bienvenida:", err));

  return savedUser;
}

/**
 * Busca usuario por email
 */
export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

/**
 * Obtiene todos los usuarios
 */
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