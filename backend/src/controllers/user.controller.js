import { deleteUserAndTurn } from "../services/user.service.js";

// Elimina un usuario y su turno asociado
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }
    await deleteUserAndTurn(Number(id));
    res.status(200).json({ message: "Usuario eliminado correctamente", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
