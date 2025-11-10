import { EntitySchema } from "typeorm";

export const Turno = new EntitySchema({
  name: "Turno",
  tableName: "turnos",
  columns: {
    id: { 
      primary: true, 
      type: "int", 
      generated: "increment" 
    },
    date: { 
      type: "date", 
      nullable: false 
    },
    startTime: { 
      type: "time", 
      nullable: false 
    },
    endTime: { 
      type: "time", 
      nullable: false 
    },
    bikeRackId: { 
      type: "int", 
      nullable: false 
    },
    created_at: { 
      type: "timestamp", 
      createDate: true, 
      default: () => "CURRENT_TIMESTAMP" 
    },
    updated_at: { 
      type: "timestamp", 
      updateDate: true, 
      default: () => "CURRENT_TIMESTAMP" 
    },
  },
});
