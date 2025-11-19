"use strict";
import { AppDataSource } from "./configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt"; 

export async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const count = await userRepository.count();
    if (count > 0) return; 
    const users = [
      {
        username: "Admin",
        rut: "12345678-9",
        email: "admin@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin"
      },
      {
        username: "Usuario Prueba",
        rut: "98765432-1",
        email: "usuario@gmail.com",
        password: await bcrypt.hash("usuario123", 10),
        role: "specter"
      },
      {
        username: "Guardia Prueba",
        rut: "11223344-5",
        email: "guardia@gmail.com",
        password: await bcrypt.hash("guardia123", 10),
        role: "guard"
      }
    ];

    console.log("Creando usuarios...");
    for (const u of users) {
      await userRepository.save(userRepository.create(u));
      console.log(`Usuario '${u.username}' creado: ${u.email}`);
    }
  } catch (error) {
    console.error("Error al crear usuarios:", error);
    throw error;
  }
}