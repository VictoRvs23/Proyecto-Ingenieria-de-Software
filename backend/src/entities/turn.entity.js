import { EntitySchema } from "typeorm";

export const Turn = new EntitySchema({
  name: "Turn",
  tableName: "turns",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    user_id: {
      type: "int",
      nullable: false,
    },
    bicicletero: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    jornada: {
      type: "varchar",
      length: 50,
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
      },
    },
  },
  indices: [
    {
      name: "IDX_TURN_UNIQUE",
      columns: ["bicicletero", "jornada"],
      unique: true,
      where: "bicicletero IS NOT NULL AND jornada IS NOT NULL",
    },
  ],
});
