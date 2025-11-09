"use strict";
import Joi from "joi";

export const spaceValidation = Joi.object({
    space: Joi.number()
        .integer()
        .min(0)
        .max(15)
        .required()
        .messages({
            "number.base": "El espacio disponible debe ser un número entero.",
            "number.min": "El espacio disponible no puede ser negativo.",
            "numer.max": "El espacio disponible no puede exceder 15.",
            "any.required": "El espacio disponible es obligatorio."
        }),
    })
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten campos adicionales",
      });