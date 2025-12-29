import { EntitySchema } from "typeorm";

export const Guard = new EntitySchema({
  name: "Guard",
  tableName: "guards",
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
    bicicletero: {
        type: "int",
        nullable: false,
    },
    turn: {
        type: "varchar",
        length: 50,
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
    informs: {
      type: "one-to-many",
      target: "Inform",
      inverseSide: "guard",
    },
  },
});
