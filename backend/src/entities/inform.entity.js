import { EntitySchema } from "typeorm";

export const Inform = new EntitySchema({
  name: "Inform",
  tableName: "informs",
  columns: {
    id: {
      primary: true, 
      type: "int", 
      generated: "increment" 
    },
    fecha_hora: { 
      type: "timestamp", 
      createDate: true 
    },
    bicicletero_number: {
      type: "int", 
      nullable: false 
    }, 
    estado_nuevo: { 
      type: "varchar", 
      length: 50, 
      nullable: false 
    }, 
    user_email_snapshot: { 
      type: "varchar", 
      length: 255, 
      nullable: true 
    },
    nota: {
      type: "text", 
      nullable: true 
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      nullable: false,
    },
    bike: {
      type: "many-to-one",
      target: "Bike",
      joinColumn: { name: "bike_id" },
      nullable: false,
    }
  },
});