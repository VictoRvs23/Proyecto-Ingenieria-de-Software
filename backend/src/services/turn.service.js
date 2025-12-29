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

export async function createOrUpdateTurn(userId, bicicletero, jornada) {
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

    if (bicicletero && jornada) {
      const existingTurn = await turnRepository.findOne({
        where: { 
          bicicletero, 
          jornada 
        },
      });
      
      if (existingTurn && existingTurn.user_id !== userId) {
        const conflictUser = await userRepository.findOne({
          where: { id: existingTurn.user_id },
        });
        throw new Error(
          `El guardia ${conflictUser.nombre} ya tiene asignado el turno de ${jornada} en el bicicletero ${bicicletero}. Solo un guardia puede tener ese turno.`
        );
      }
    }

    let turn = await turnRepository.findOne({
      where: { user_id: userId },
    });

    if (turn) {
      turn.bicicletero = bicicletero || null;
      turn.jornada = jornada || null;
      await turnRepository.save(turn);
      return turn;
    } else {
      const newTurn = turnRepository.create({
        user_id: userId,
        bicicletero: bicicletero || null,
        jornada: jornada || null,
      });
      await turnRepository.save(newTurn);
      return newTurn;
    }
  } catch (error) {
    throw error;
  }
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
    
    const turnosConDatos = turnsData.filter(t => t.bicicletero && t.jornada);
    
    for (let i = 0; i < turnosConDatos.length; i++) {
      for (let j = i + 1; j < turnosConDatos.length; j++) {
        if (
          turnosConDatos[i].bicicletero === turnosConDatos[j].bicicletero &&
          turnosConDatos[i].jornada === turnosConDatos[j].jornada
        ) {
          const user1 = await userRepository.findOne({ where: { id: turnosConDatos[i].userId } });
          const user2 = await userRepository.findOne({ where: { id: turnosConDatos[j].userId } });
          throw new Error(
            `Conflicto: ${user1?.nombre || 'Usuario'} y ${user2?.nombre || 'Usuario'} tienen el mismo turno asignado: ${turnosConDatos[i].jornada} en bicicletero ${turnosConDatos[i].bicicletero}`
          );
        }
      }
    }
    
    for (const turnData of turnsData) {
      try {
        const turn = await createOrUpdateTurn(
          turnData.userId,
          turnData.bicicletero,
          turnData.jornada
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
