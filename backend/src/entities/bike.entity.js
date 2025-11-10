import { EntitySchema } from "typeorm";

export const AdminBicicletero = new EntitySchema({
  name: "Bike",
  tableName: "bikes",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    model:{
        type: "varchar",
        length: 100,
        nullable: false,
    },
    color:{
      type: "varchar",
      length: 50,
      nullable: false,
    },
    owner: {
      type: "varchar",
      length: 255,
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
});
