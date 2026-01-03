import { EntitySchema } from "typeorm";

export const Reporte = new EntitySchema({
  name: "Reporte",
  tableName: "reportes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    titulo: {
      type: "varchar",
      nullable: false, 
      default: "Reporte sin título" 
    },
    descripcion: {
      type: "text",
      nullable: false,
    },
    tipo: {
      type: "varchar",
      nullable: false,
    },
    estado: {
      type: "varchar",
      default: "Pendiente", 
    },
    es_anonimo: {
      type: "boolean",
      default: false,
    },
    imagenUrl: {
      type: "varchar",
      nullable: true,
    },
    respuesta: {
      type: "text", 
      nullable: true, 
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
      eager: true,
    },
  },
});