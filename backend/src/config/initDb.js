"use strict";
import { AppDataSource } from "./configDb.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function seedBicicleteros(dataSource) {
  const repo = dataSource.getRepository("Bicicletero");

  const count = await repo.count();
  if (count > 0) {
    console.log("Bicicleteros ya existentes. No se crearán nuevos.");
    return;
  }

  console.log("Creando bicicleteros iniciales...");

  const bicicleteros = [
    { number: 1, space: 15 },
    { number: 2, space: 15 },
    { number: 3, space: 15 },
    { number: 4, space: 15 },
  ];

  for (const b of bicicleteros) {
    await repo.save(b);
  }

  console.log("Bicicleteros creados");
}

export async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const count = await userRepository.count();
    if (count > 0) return;

    const users = [
      {
        username: "Admin",
        nombre: "Admin",
        rut: "12345678-9",
        email: "admin@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        numeroTelefonico: "912345678",
        role: "admin",
      },
      {
        username: "Admin Bicicletero",
        nombre: "Admin Bicicletero",
        rut: "12334455-6",
        email: "adminbici@gmail.com",
        password: await bcrypt.hash("adminbici123", 10),
        numeroTelefonico: "912334455",
        role: "adminBicicletero",
      },
      {
        username: "Usuario Prueba",
        nombre: "Usuario Prueba",
        rut: "98765432-1",
        email: "usuario@gmail.com",
        password: await bcrypt.hash("usuario123", 10),
        numeroTelefonico: "998765432",
        role: "user",
      },
      {
        username: "Guardia Prueba",
        nombre: "Guardia Prueba",
        rut: "11223344-5",
        email: "guardia@gmail.com",
        password: await bcrypt.hash("guardia123", 10),
        numeroTelefonico: "911223344",
        role: "guard",
      },
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

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Base de datos conectada");

    await createUsers();
    await seedBicicleteros(AppDataSource);

    console.log("Inicialización completada");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}