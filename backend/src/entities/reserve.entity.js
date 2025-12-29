import { EntitySchema } from "typeorm";

export const Reserve = new EntitySchema({
  name: "Reserve",
  tableName: "reserves",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    token: {
      type: "int",
      unique: true,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: "solicitada"
    },
    user_id: {
      type: "int",
      nullable: false,
    },
    bike_id: {
      type: "int",
      nullable: false,
    },
    bicicletero_number: {
      type: "int",
      nullable: false,
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
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id"
      },
      nullable: false,
      onDelete: "CASCADE",
    },
    bike: {
      type: "many-to-one",
      target: "Bike", 
      joinColumn: { name: "bike_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    bicicletero: {
      type: "many-to-one",
      target: "Bicicletero",
      joinColumn: { 
        name: "bicicletero_number",
        referencedColumnName: "number" 
      },
      nullable: false,
      onDelete: "CASCADE",
    }
  },
});
