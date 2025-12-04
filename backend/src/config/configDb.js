"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, DB_PASSWORD, DB_PORT } from "./configEnv.js";
import { createUsers, seedBicicleteros } from "./initDb.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: `${DB_PORT}`,
  username: `${DB_USERNAME}`,
  password: `${DB_PASSWORD}`,
  database: `${DATABASE}`,
  entities: ["src/entities/**/*.js"],
  synchronize: true, 
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a BD exitosa");
    await createUsers();
    await seedBicicleteros(AppDataSource);
  } catch (error) {
    console.error("Error al conectar a BD:", error);
    throw error;
  }
}
