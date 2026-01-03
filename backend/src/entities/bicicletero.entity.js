import { EntitySchema } from "typeorm";

export const Bicicletero = new EntitySchema({
  name: "Bicicletero",
  tableName: "bicicleteros",
  columns: {
    number: {
      primary: true,
      type: "int",
      nullable: false,
    },
    space: {
      type: "int",
      nullable: false,
      default: 15,
    },
    disabledSpaces: {
      type: "simple-array",
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
    informs: {
      type: "one-to-many",
      target: "Inform",
      inverseSide: "bicicletero",
    },
    reserves: {
      type: "one-to-many",
      target: "Reserve", 
      inverseSide: "bicicletero",
    },
  },
});
