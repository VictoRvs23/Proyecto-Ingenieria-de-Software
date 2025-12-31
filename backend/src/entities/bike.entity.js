import { EntitySchema } from "typeorm";

export const Bike = new EntitySchema({
  name: "Bike",
  tableName: "bikes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    brand: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    model: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    color: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    bikeImage: {
      type: "varchar",
      length: 255,
      nullable: true, 
      default: "/default-bike.png" 
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
    bicicletero: {
      type: "many-to-one",
      target: "Bicicletero",
      joinColumn: {
        name: "bicicletero_number",
        referencedColumnName: "number",
      },
      inverseSide: "bikes",
    },
    user: { 
      type: "many-to-one", 
      target: "User",
      joinColumn: { name: "user_id" }, 
      inverseSide: "bikes", 
      onDelete: "CASCADE"   
    },
  },
});