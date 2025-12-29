"use strict";
import Joi from "joi";

export const createReserveValidation = Joi.object({
  bike_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID de la bicicleta es obligatorio",
      "number.base": "El ID de la bicicleta debe ser un número",
      "number.positive": "El ID de la bicicleta debe ser positivo",
    }),
  bicicletero_number: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El número de bicicletero es obligatorio",
      "number.base": "El bicicletero debe ser un número"
    })
}).unknown(false).messages({
  "object.unknown": "No se permiten campos adicionales",
});

export const updateReserveValidation = Joi.object({
  estado: Joi.string()
    .valid("solicitada", "ingresada", "entregada", "cancelada")
    .required()
    .messages({
      "any.only": "El estado debe ser uno de: solicitada, ingresada, entregada, cancelada",
      "any.required": "El campo 'estado' es obligatorio",
    }),
  space_number: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "El número de espacio debe ser un número",
      "number.positive": "El número de espacio debe ser positivo",
    })
}).unknown(false).messages({
  "object.unknown": "No se permiten campos adicionales",
});
