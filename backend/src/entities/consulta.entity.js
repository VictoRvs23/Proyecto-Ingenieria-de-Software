import { EntitySchema } from "typeorm";

export const Consulta = new EntitySchema({
  name: "Consulta",
  tableName: "consultas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    pregunta: {
      type: "text",
      nullable: false,
    },
    respuesta: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "varchar",
      default: "Pendiente",
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      eager: true,
    },
  },
});
