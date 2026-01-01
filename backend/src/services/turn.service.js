import { AppDataSource } from "../config/configDb.js";
import { Turn } from "../entities/turn.entity.js";
import { User } from "../entities/user.entity.js";

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
      return turn;
    } else {
      const newTurn = turnRepository.create({
        user_id: userId,
        bicicletero: bicicletero || null,
        hora_inicio: hora_inicio || null,
        hora_salida: hora_salida || null,
      });
      await turnRepository.save(newTurn);
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
    // Obtener el turno del guardia actual
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

    // Si no tiene bicicletero o horarios asignados, no hay reemplazo
    if (!currentGuardTurn.bicicletero || !currentGuardTurn.hora_inicio || !currentGuardTurn.hora_salida) {
      return {
        currentTurn: currentGuardTurn,
        replacementTurn: null,
      };
    }

    // Obtener todos los turnos en el mismo bicicletero
    const allTurnsInBicicletero = await turnRepository.find({
      where: { bicicletero: currentGuardTurn.bicicletero },
      relations: ['user'],
    });

    // Filtrar turnos válidos (que tengan hora_inicio y hora_salida)
    const validTurns = allTurnsInBicicletero.filter(
      turn => turn.hora_inicio && turn.hora_salida && turn.user_id !== userId
    );

    // Convertir tiempo a minutos para comparación
    const toMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentEndMinutes = toMinutes(currentGuardTurn.hora_salida);

    // Buscar el turno que comienza más tarde después del turno actual
    let replacementTurn = null;
    let earliestReplacementTime = Infinity;

    for (const turn of validTurns) {
      const turnStartMinutes = toMinutes(turn.hora_inicio);
      
      // El turno de reemplazo debe comenzar después o en el mismo momento que termina el turno actual
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
