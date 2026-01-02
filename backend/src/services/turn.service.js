import { AppDataSource } from "../config/configDb.js";
import { Turn } from "../entities/turn.entity.js";
import { User } from "../entities/user.entity.js";
import { crearNotificacionService } from "./notificacion.service.js"; 

const turnRepository = AppDataSource.getRepository(Turn);
const userRepository = AppDataSource.getRepository(User);

export async function getAllTurns() {
  try {
    const turns = await turnRepository.find({
      relations: ['user'],
    });
    return turns;
  } catch (error) {
    throw new Error(`Error al obtener turnos: ${error.message}`);
  }
}

export async function getTurnByUserId(userId) {
  try {
    const turn = await turnRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    return turn;
  } catch (error) {
    throw new Error(`Error al obtener turno del usuario: ${error.message}`);
  }
}

export async function createOrUpdateTurn(userId, bicicletero, hora_inicio, hora_salida) {
  try {
    const user = await userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    if (user.role !== "guard") {
      throw new Error("Solo se pueden asignar turnos a guardias");
    }

    if ((hora_inicio || hora_salida) && (!hora_inicio || !hora_salida)) {
      throw new Error("Debe ingresar tanto hora de inicio como hora de salida");
    }

    if (bicicletero && hora_inicio && hora_salida) {
      const existingTurns = await turnRepository.find({
        where: { bicicletero },
      });
      
      for (const existingTurn of existingTurns) {
        if (existingTurn.user_id !== userId && existingTurn.hora_inicio && existingTurn.hora_salida) {
          const existingStart = existingTurn.hora_inicio;
          const existingEnd = existingTurn.hora_salida;
          
          if (horariosSeSuperponen(hora_inicio, hora_salida, existingStart, existingEnd)) {
            const conflictUser = await userRepository.findOne({
              where: { id: existingTurn.user_id },
            });
            throw new Error(
              `El guardia ${conflictUser.nombre} tiene el mismo turno ${hora_inicio} - ${hora_salida} en el bicicletero ${bicicletero}. Los horarios no pueden ser iguales.`
            );
          }
        }
      }
    }

    let turn = await turnRepository.findOne({
      where: { user_id: userId },
    });

    if (turn) {
      turn.bicicletero = bicicletero || null;
      turn.hora_inicio = hora_inicio || null;
      turn.hora_salida = hora_salida || null;
      await turnRepository.save(turn);

      if (hora_inicio && hora_salida) {
        await crearNotificacionService({
          userId: userId,
          mensaje: `📅 Tu turno ha sido actualizado: ${hora_inicio} - ${hora_salida} en Bicicletero ${bicicletero || 'Sin asignar'}.`,
          tipo: 'TURNO',
          referenciaId: turn.id
        });
      }

      return turn;
    } else {
      const newTurn = turnRepository.create({
        user_id: userId,
        bicicletero: bicicletero || null,
        hora_inicio: hora_inicio || null,
        hora_salida: hora_salida || null,
      });
      await turnRepository.save(newTurn);

      if (hora_inicio && hora_salida) {
        await crearNotificacionService({
          userId: userId,
          mensaje: `📅 Se te ha asignado un nuevo turno: ${hora_inicio} - ${hora_salida} en Bicicletero ${bicicletero || 'Sin asignar'}.`,
          tipo: 'TURNO',
          referenciaId: newTurn.id
        });
      }

      return newTurn;
    }
  } catch (error) {
    throw error;
  }
}

function horariosSeSuperponen(inicio1, fin1, inicio2, fin2) {
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1 = toMinutes(inicio1);
  const end1 = toMinutes(fin1);
  const start2 = toMinutes(inicio2);
  const end2 = toMinutes(fin2);
  
  return start1 < end2 && start2 < end1;
}

export async function deleteTurn(userId) {
  try {
    const turn = await turnRepository.findOne({
      where: { user_id: userId },
    });
    
    if (!turn) {
      throw new Error("Turno no encontrado");
    }
    
    await turnRepository.remove(turn);
    return { message: "Turno eliminado exitosamente" };
  } catch (error) {
    throw new Error(`Error al eliminar turno: ${error.message}`);
  }
}

export async function updateMultipleTurns(turnsData) {
  try {
    const results = [];
    const errors = [];
    
    for (const turnData of turnsData) {
      try {
        const turn = await createOrUpdateTurn(
          turnData.userId,
          turnData.bicicletero,
          turnData.hora_inicio,
          turnData.hora_salida
        );
        results.push(turn);
      } catch (error) {
        errors.push({
          userId: turnData.userId,
          error: error.message,
        });
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Algunos turnos no se pudieron guardar: ${JSON.stringify(errors)}`);
    }
    
    return results;
  } catch (error) {
    throw error;
  }
}

export async function getGuardTurnWithReplacement(userId) {
  try {
    const currentGuardTurn = await turnRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!currentGuardTurn) {
      return {
        currentTurn: null,
        replacementTurn: null,
      };
    }

    if (!currentGuardTurn.bicicletero || !currentGuardTurn.hora_inicio || !currentGuardTurn.hora_salida) {
      return {
        currentTurn: currentGuardTurn,
        replacementTurn: null,
      };
    }

    const allTurnsInBicicletero = await turnRepository.find({
      where: { bicicletero: currentGuardTurn.bicicletero },
      relations: ['user'],
    });

    const validTurns = allTurnsInBicicletero.filter(
      turn => turn.hora_inicio && turn.hora_salida && turn.user_id !== userId
    );

    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentEndMinutes = toMinutes(currentGuardTurn.hora_salida);
    let replacementTurn = null;
    let earliestReplacementTime = Infinity;

    for (const turn of validTurns) {
      const turnStartMinutes = toMinutes(turn.hora_inicio);
      
      if (turnStartMinutes >= currentEndMinutes) {
        if (turnStartMinutes < earliestReplacementTime) {
          earliestReplacementTime = turnStartMinutes;
          replacementTurn = turn;
        }
      }
    }

    return {
      currentTurn: currentGuardTurn,
      replacementTurn: replacementTurn,
    };
  } catch (error) {
    throw new Error(`Error al obtener turno del guardia con reemplazo: ${error.message}`);
  }
}