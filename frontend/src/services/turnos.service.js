import instance from './root.service';

export const turnosService = {
    getTurnos() {
        return instance.get('/turnos');
    },

    getTurnoById(id) {
        return instance.get(`/turnos/${id}`);
    },

    createTurno(turnoData) {
        return instance.post('/turnos', turnoData);
    },

    updateTurno(id, turnoData) {
        return instance.put(`/turnos/${id}`, turnoData);
    },

    deleteTurno(id) {
        return instance.delete(`/turnos/${id}`);
    }
};