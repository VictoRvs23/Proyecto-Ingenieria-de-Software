import { EntitySchema } from "typeorm";

export const Notificacion = new EntitySchema({
  name: "Notificacion",
  tableName: "notificaciones",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    mensaje: {
      type: "text",
      nullable: false,
    },
    tipo: {
      type: "varchar",
      nullable: true,
    },
    referenciaId: {
      type: "int",
      nullable: true, 
    },
    leido: {
      type: "boolean",
      default: false, 
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      target: "User", 
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE", 
    },
  },
});