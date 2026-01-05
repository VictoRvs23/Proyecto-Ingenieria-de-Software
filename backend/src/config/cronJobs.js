// config/cronJobs.js
import cron from 'node-cron';
import { generateDailyReport } from '../services/inform.service.js';
import { cancelExpiredReserves } from '../services/reserve.service.js';
import { AppDataSource } from './configDb.js';

export function setupCronJobs() {
    
    cron.schedule('2 20 * * *', async () => {
        try {
            console.log(`[${new Date().toISOString()}] Ejecutando generación automática de reporte diario...`);
            
            
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log('Conexión a BD inicializada para cron job');
            }
            
            const report = await generateDailyReport();
            console.log(`Reporte diario generado automáticamente: ${report.filename}`);
            
        } catch (error) {
            console.error(`Error en generación automática de reporte: ${error.message}`);
        }
    }, {
        scheduled: true,
        timezone: "America/Santiago"
    });
    
    
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log(`[${new Date().toISOString()}] Ejecutando limpieza de reservas expiradas...`);
            
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
            
            const result = await cancelExpiredReserves();
            if (result.cancelled > 0) {
                console.log(`${result.cancelled} reservas canceladas por expiración`);
            }
            
        } catch (error) {
            console.error(`Error en limpieza de reservas: ${error.message}`);
        }
    }, {
        scheduled: true,
        timezone: "America/Santiago"
    });
    
    console.log('Cron jobs configurados:');
    console.log('- Generación automática de reportes a las 20:02');
    console.log('- Limpieza de reservas expiradas cada 5 minutos');
}