import { EntitySchema } from "typeorm";

export const Inform = new EntitySchema({
  name: "Inform",
  tableName: "informs",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    date: {
        type: "date",
        nullable: false,
    },
    uploadTime: {
        type: "varchar",
        length: 50,
        nullable: false,
    },
    bicicleto: {
        type: "varchar",
        length: 100,
        nullable: false,
    },
    guard: {
        type: "varchar",
        length: 100,
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
});
