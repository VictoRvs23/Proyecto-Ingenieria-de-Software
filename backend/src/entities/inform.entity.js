import { EntitySchema } from "typeorm";

export const Inform = new EntitySchema({
  name: "Inform",
  tableName: "informs",
  columns: {
    date: {
        primary: true,
        type: "date",
        nullable: false,
    },
    bicicletero_number: {
        type: "int",
        nullable: false,
    },
    guard_id: {
        type: "int",
        nullable: false,
    },
    observation: {
        type: "text",
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
    bicicletero: {
      type: "many-to-one",
      target: "Bicicletero",
      joinColumn: {
        name: "bicicletero_number",
        referencedColumnName: "number",
      },
      inverseSide: "informs",
    },
    guard: {
      type: "many-to-one",
      target: "Guard",
      joinColumn: {
        name: "guard_id",
        referencedColumnName: "id",
      },
      inverseSide: "informs",
    },
  },
});
