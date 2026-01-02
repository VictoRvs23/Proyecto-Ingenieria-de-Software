const SERVER_URL = "http://localhost:3000/api";

export const createConsulta = async (pregunta) => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/consultas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pregunta }),
    });

    if (!response.ok) {
      throw new Error("Error al crear consulta");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getMyConsultas = async () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/consultas/my-consultas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener consultas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getAllConsultas = async () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/consultas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener consultas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const responderConsulta = async (id, estado, respuesta) => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/consultas/${id}/responder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado, respuesta }),
    });

    if (!response.ok) {
      throw new Error("Error al responder consulta");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteConsulta = async (id) => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${SERVER_URL}/consultas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar consulta");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
