"use strict";
import Joi from "joi";


export const createReserveValidation = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID de usuario es obligatorio",
      "number.base": "El ID de usuario debe ser un número",
      "number.positive": "El ID de usuario debe ser positivo",
    }),
});

export const updateReserveValidation  = Joi.object({
  estado: Joi.string()
    .valid("ingresada", "entregada", "cancelada")
    .required()
    .messages({
      "any.only": "El estado debe ser uno de: ingresada, en curso, finalizada, cancelada",
      "any.required": "El campo 'estado' es obligatorio",
    }),
});

export const tokenValidation  = Joi.object({
  token: Joi.number()
    .integer()
    .min(1000)
    .max(9999)
    .required()
    .messages({
      "number.base": "El token debe ser un número de 4 dígitos",
      "number.min": "El token debe tener al menos 4 dígitos",
      "number.max": "El token debe tener como máximo 4 dígitos",
      "any.required": "El token es obligatorio",
    }),
});
