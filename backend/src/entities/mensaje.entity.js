import { EntitySchema } from "typeorm";

export const Mensaje = new EntitySchema({
  name: "Mensaje",
  tableName: "mensajes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    contenido: {
      type: "text",
      nullable: false,
    },
    rol_sender: { 
      type: "varchar",
      length: 50,
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
    },
  },
});