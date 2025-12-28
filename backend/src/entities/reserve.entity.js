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
      length: 100,
      nullable: false,
      default: "ingresada"
    },
    user_id: {
      type: "int",
      nullable: false,
    },
    bike_id: {
      type: "int",
      nullable: true,
    },
    //para el multer
    foto_url: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    doc_url: {
      type: "varchar", 
      length: 500,
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
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id"
      },
      nullable: false,
      onDelete: "CASCADE",
      inverseSide: "reserves"
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
      inverseSide: "reserves",
      nullable: false,
      onDelete: "CASCADE",
    }
  },
  indices: [
    {
      name: "IDX_RESERVE_TOKEN",
      columns: ["token"],
      unique: true
    },
    {
      name: "IDX_RESERVE_USER",
      columns: ["user_id"]
    },
    {
      name: "IDX_RESERVE_BIKE",
      columns: ["bike_id"]
    }
  ]
});