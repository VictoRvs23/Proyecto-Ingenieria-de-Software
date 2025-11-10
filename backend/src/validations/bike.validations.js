"use strict";
import Joi from "joi";

export const bikeValidation = Joi.object({
    model: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "El modelo de la bicicleta no puede estar vacío.",
            "any.required": "El modelo de la bicicleta es obligatorio.",
            "string.base": "El modelo de la bicicleta debe ser de tipo texto.",
            "string.min": "El modelo de la bicicleta debe tener al menos 2 caracteres.",
            "string.max": "El modelo de la bicicleta debe tener como máximo 50 caracteres.",
        }),
    color: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.empty": "El color de la bicicleta no puede estar vacío.",
            "any.required": "El color de la bicicleta es obligatorio.",
            "string.base": "El color de la bicicleta debe ser de tipo texto.",
            "string.min": "El color de la bicicleta debe tener al menos 3 caracteres.",
            "string.max": "El color de la bicicleta debe tener como máximo 30 caracteres.",
        }),
    owner: Joi.string()
        .min(5)
        .max(100)
        .required()
        .messages({
            "string.empty": "El nombre del propietario no puede estar vacío.",
            "any.required": "El nombre del propietario es obligatorio.",
            "string.base": "El nombre del propietario debe ser de tipo texto.",
            "string.min": "El nombre del propietario debe tener al menos 5 caracteres.",
            "string.max": "El nombre del propietario debe tener como máximo 100 caracteres.",
        }),
    })
      .unknown(false)
      .messages({
        "object.unknown": "No se permiten campos adicionales",
      });