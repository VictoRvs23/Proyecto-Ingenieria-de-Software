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
    hora_inicio: {
      type: "time",
      nullable: true,
    },
    hora_salida: {
      type: "time",
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
      columns: ["bicicletero", "hora_inicio", "hora_salida"],
      unique: true,
      where: "bicicletero IS NOT NULL AND hora_inicio IS NOT NULL AND hora_salida IS NOT NULL",
    },
  ],
});
