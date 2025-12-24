"use strict";
import Joi, { date } from "joi";

export const informValidation = Joi.object({
    date: Joi.date()
        .required()
        .messages({
            "date.base": "La fecha debe ser una fecha válida.",
            "any.required": "La fecha es obligatoria.",
        }),
    bicicletero_number: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "El número de bicicletero debe ser valido [1],[2],[3],[4].",
            "any.required": "El número de bicicletero es obligatorio.",
        }),
    guard_id: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "El ID del guardia debe ser un número entero válido.",
            "any.required": "El ID del guardia es obligatorio.",
        }),
    observation: Joi.string()
        .max(500)
        .allow(null, '')
        .messages({
            "string.base": "La observación debe ser una cadena de texto.",
            "string.max": "La observación no puede exceder los 500 caracteres.",
        }),
    })
        .unknown(false)
        .messages({
      "object.unknown": "No se permiten campos adicionales",
    });