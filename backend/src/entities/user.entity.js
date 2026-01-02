import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "user",
    },
    numeroTelefonico: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    userImage: {
      type: "varchar",
      length: 255,
      nullable: true, 
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    bikes: {
      type: "one-to-many", 
      target: "Bike",
      inverseSide: "user",
    },
  },
  reportes: {
      type: "one-to-many",
      target: "Reporte",
      inverseSide: "user",
    },
});