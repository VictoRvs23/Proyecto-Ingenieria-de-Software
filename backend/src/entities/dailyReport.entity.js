import { EntitySchema } from "typeorm";

export const DailyReport = new EntitySchema({
    name: "DailyReport",
    tableName: "daily_reports",
    columns: {
        id: { 
            primary: true,
            type: "int", 
            generated: "increment" 
        },
        fecha_reporte: {
            type: "date", 
            unique: true, 
            nullable: false 
        },
        filename: {
            type: "varchar", 
            length: 100, 
            nullable: false 
        },
        pdf_data: { 
            type: "bytea", 
            nullable: false 
        }, 
        created_at: {
            type: "timestamp", 
            createDate: true 
        },
    },
});